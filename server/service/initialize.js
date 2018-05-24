const config = require('../config');
const promise = require('../module/promise');
const request = require('../module/request');
const afterMe = require('../service/afterMe');
const mongoose = require('../module/mongoose');
const database = require('../service/database');
let init = false;
let antiInit = false;
const model = {
    getInitStatus() {
        return init;
    },
    setInitStatus(status) {
        init = status;
    },
    getAntiInitStatus() {
        return antiInit;
    },
    setAntiInitStatus(status) {
        antiInit = status;
    },
    async getMongoDBProcess() {
        let command = `ps aux|grep ${config.database.bin}/mongod|grep grep -v|awk '{print $2}'`;
        return Boolean(await promise.runCommandInPromise(command));
    },
    async getMongoDBStatus() {
        let command = `${config.database.bin}/mongo --quiet --eval "db.serverStatus().ok"`;
        return await model.getMongoDBProcess() ? await promise.runCommandInPromise(command) === '1' : false;
    },
    async getOrcaFSStatus() {
        let token = await afterMe.getToken();
        let res = await request.get(config.api.orcafs.createstatus, {}, token, true);
        return !res.errorId && res.data.currentStep && res.data.currentStep === res.data.totalStep ? true : false;
    },
    async getMongoDBMasterOrNot() {
        let command = `${config.database.bin}/mongo --quiet --eval "db.isMaster().ismaster"`;
        return await model.getMongoDBProcess() ? await promise.runCommandInPromise(command) === 'true' : false;
    },
    async getOrcaFSMasterOrNot() {
        let command = `ps aux|grep orcafs-mgmtd|grep grep -v|awk '{print $2}'`;
        return Boolean(await promise.runCommandInPromise(command));
    },
    async checkClusterEnv(param) {
        let { metadataServerIPs, storageServerIPs } = param;
        let metadataServerIPsError = await Promise.all(metadataServerIPs.map(async metadata => (Object.values(await request.get(config.api.orcafs.gettoken.replace('localhost', metadata), {}, {}, true, { tokenId: '' }))[0] ? { status: '', help: '' } : { status: 'error', help: 1 })));
        let storageServerIPsError = await Promise.all(storageServerIPs.map(async storage => (Object.values(await request.get(config.api.orcafs.gettoken.replace('localhost', storage), {}, {}, true, { tokenId: '' }))[0] ? { status: '', help: '' } : { status: 'error', help: 1 })));
        let result = !Boolean(metadataServerIPsError.concat(storageServerIPsError).filter(ip => (ip.status)).length);
        return { metadataServerIPsError, storageServerIPsError, result };
    },
    async getRaidRecommendedConfiguration(param) {
        let { metadataServerIPs, storageServerIPs } = param;
        let ipList = Array.from(new Set(metadataServerIPs.concat(storageServerIPs)));
        let diskGroup = await Promise.all(ipList.map(async ip => ({ ip, diskList: Object.assign(await afterMe.getDiskList({ ip })).data })));
        let metadataList = {};
        let storageList = {};
        diskGroup.forEach(item => {
            let { ip, diskList } = item;
            diskList = diskList.map(disk => ({ diskName: disk.diskName, diskType: disk.diskName.includes('nvme') ? 'ssd' : 'hdd' }));
            let ssdList = diskList.filter(disk => (disk.diskType === 'ssd'));
            let hddList = diskList.filter(disk => (disk.diskType === 'hdd'));
            if (metadataServerIPs.includes(ip) && storageServerIPs.includes(ip)) {
                if (ssdList.length) {
                    metadataList[ip] = [{ raidLevel: 1, diskList: ssdList.slice(0, 2).map(ssd => (ssd.diskName)), diskType: 'ssd' }];
                    storageList[ip] = [{ raidLevel: 1, diskList: ssdList.slice(2, 4).map(ssd => (ssd.diskName)), diskType: 'ssd' }];
                }
            } else if (metadataServerIPs.includes(ip)) {

            } else if (storageServerIPs.includes(ip)) {

            }
        });
        return { metadataServerIPs: metadataList, storageServerIPs: storageList };
    },
    handleInitParam(param) {
        let { metadataServerIPs: meta, storageServerIPs: storage, clientIPs: client, managementServerIPs: mgmt, enableHA: HA, floatIPs: floatIP, hbIPs: heartbeatIP } = param;
        let mongodbParam = {};
        let orcafsParam = [];
        let nodeList = Array.from(new Set(mgmt.concat(meta, storage)));
        if (HA) {
            mongodbParam = { primary: mgmt[0], secondary: mgmt[1], arbiter: meta[0], replicaSet: true };
        } else {
            mongodbParam = { primary: mgmt[0], replicaSet: false };
            orcafsParam = [
                {
                    type: 'meta',
                    host: meta.map(ip => ({ ip }))
                },
                {
                    type: 'storage',
                    host: storage.map(ip => ({ ip }))
                },
                {
                    type: 'client',
                    host: client.map(ip => ({ ip }))
                },
                {
                    type: 'mgmt',
                    host: mgmt.map(ip => ({ ip }))
                }
            ]
        }
        return { mongodbParam, orcafsParam, nodeList };
    },
    async initMongoDB(param) {
        let { primary, secondary, arbiter, replicaSet } = param;
        if (!replicaSet) {
            let command = `${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --fork`;
            await promise.runCommandInPromise(command);
            await promise.runCommandInPromise(`sed -i "/MongoDB/ a ${command}" /etc/rc.local`);
        } else {
            let command = `${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --replSet ${config.database.replicaSet} --bind_ip_all --fork`;
            let ipList = [primary, secondary, arbiter];
            let conf = {
                _id: config.database.replicaSet,
                members: []
            };
            for (let i = 0; i < ipList.length; i++) {
                i ? await promise.runCommandInRemoteNodeInPromise(ipList[i], command) : await promise.runCommandInPromise(command);
                conf.members.push(i === 2 ? { _id: i, host: ipList[i], arbiterOnly: true } : { _id: i, host: ipList[i], priority: 2 - i });
            }
            await promise.writeFileInPromise('/tmp/.initiatedb.js', `rs.initiate(${JSON.stringify(conf)})`);
            for (let i = 0; i < ipList.length; i++) {
                i ? await promise.runCommandInRemoteNodeInPromise(ipList[i], `sed -i "/MongoDB/ a ${command}" /etc/rc.local`) : await promise.runCommandInPromise(`sed -i '/MongoDB/ a ${command}' /etc/rc.local`);
            }
            await promise.runCommandInPromise(`${config.database.bin}/mongo /tmp/.initiatedb.js`);
        }
    },
    async initOrcaFS(param) {
        let token = await afterMe.getToken();
        return await request.post(config.api.orcafs.createcluster, param, token, true);
    },
    async getOrcaFSInitProgress() {
        let token = await afterMe.getToken();
        return await request.get(config.api.orcafs.createstatus, {}, token, true);
    },
    async saveInitInfo(param) {
        await promise.runCommandInPromise('sleep 20');
        await mongoose.connect(`mongodb://localhost/${config.database.name}`);
        for (let i of Object.keys(param)) {
            await database.addSetting({ key: config.setting[i], value: param[i] });
        }
        await database.addUser({ username: 'admin', password: '123456' });
        await database.addSetting({ key: config.setting.snapshotSetting, value: config.snapshot });
    },
    async antiInitMongoDB(ipList) {
        let command = `killall mongod; sleep 5; rm -rf ${config.database.dbpath}/*`;
        for (let i = 0; i < ipList.length; i++) {
            if (!i) {
                await promise.runCommandInPromise(command);
                await promise.runCommandInPromise('sed -i "/mongod/d" /etc/rc.local');
            } else {
                await promise.runCommandInRemoteNodeInPromise(ipList[i], command);
                await promise.runCommandInRemoteNodeInPromise(ipList[i], 'sed -i "/mongod/d" /etc/rc.local');
            }
        }
    },
    async antiInitOrcaFS() {
        let token = await afterMe.getToken();
        return await request.post(config.api.orcafs.destroycluster, {}, token, true);
    },
    async restartServer(nodeList) {
        let command = 'service orcafs-gui restart';
        nodeList = nodeList.reverse();
        for (let i = 0; i < nodeList.length; i++) {
            i === nodeList.length - 1 ? await promise.runCommandInPromise(command) : await promise.runCommandInRemoteNodeInPromise(nodeList[i], command);
        }
    }
};
module.exports = model;