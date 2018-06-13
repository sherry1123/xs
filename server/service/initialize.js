const config = require('../config');
const promise = require('../module/promise');
const request = require('../module/request');
const handler = require('../module/handler');
const afterMe = require('../service/afterMe');
const mongoose = require('../module/mongoose');
const database = require('../service/database');
const model = {
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
        // let diskGroup = await Promise.all(ipList.map(async ip => ({ ip, diskList: Object.assign(await afterMe.getDiskList({ ip })).data })));
        let diskGroup = ipList.map(ip => ({ ip, diskList: Array.from({ length: 28 }).map((value, index) => ({ diskName: `/dev/nvme${index}n1`, totalSpace: 11489037516 })) }));
        let metadataList = {};
        let storageList = {};
        const getConfiguration = (diskList, serviceType) => {
            let containerList = Array.from({ length: serviceType === 'metadata' ? (diskList.length > 1 ? 1 : 0) : Math.floor(diskList.length / 8) });
            let raidLevel = serviceType === 'metadata' ? 1 : 5;
            let stripeSize = 1024 * 8;
            let diskType = 'ssd';
            return containerList.map(() => {
                let disks = serviceType === 'metadata' ? diskList.splice(0, 2) : diskList.splice(0, 8);
                let totalSpace = disks.map(disk => (disk.space)).reduce((prev, next) => (prev + next));
                return { raidLevel, diskList: disks, totalSpace, stripeSize, diskType };
            });
        };
        diskGroup.forEach(item => {
            let { ip, diskList } = item;
            diskList = diskList.filter(disk => (disk.diskName.includes('nvme'))).map(disk => ({ diskName: disk.diskName, space: disk.totalSpace }));
            if (metadataServerIPs.includes(ip) && storageServerIPs.includes(ip)) {
                metadataList[ip] = diskList.length ? getConfiguration(diskList, 'metadata') : [];
                storageList[ip] = diskList.length ? getConfiguration(diskList, 'storage') : [];
            } else if (metadataServerIPs.includes(ip)) {
                metadataList[ip] = diskList.length ? getConfiguration(diskList, 'metadata') : [];
            } else if (storageServerIPs.includes(ip)) {
                storageList[ip] = diskList.length ? getConfiguration(diskList, 'storage') : [];
            }
        });
        return { metadataServerIPs: metadataList, storageServerIPs: storageList };
    },
    handleInitParam(param) {
        let { metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs, enableHA, floatIPs, hbIPs, enableCustomRAID, recommendedRAID, customRAID, enableCreateBuddyGroup } = param;
        let mongodbParam = { ipList: managementServerIPs.concat(metadataServerIPs.slice(0, 1)), replicaSet: enableHA ? true : false };
        let nodeList = Array.from(new Set(managementServerIPs.concat(metadataServerIPs, storageServerIPs)));
        const handleServiceParam = (RAIDConfig, serviceType) => {
            let serviceRaidConfig = serviceType === 'metadata' ? RAIDConfig.metadataServerIPs : RAIDConfig.storageServerIPs;
            let param = [];
            if (enableCustomRAID) {
                for (let service of serviceRaidConfig) {
                    param.push({ ip: service.ip, diskGroup: service.raidList.map(raid => ({ diskList: raid.selectedDisks.map(disk => (disk.diskName)), raidLevel: raid.arrayLevel.name.toLowerCase().replace(' ', ''), stripeSize: raid.arrayStripeSize.replace(' ', '').replace('B', '').toLowerCase() })) });
                }
            } else {
                for (let service of Object.keys(serviceRaidConfig)) {
                    param.push({ ip: service, diskGroup: serviceRaidConfig[service].map(raid => ({ diskList: raid.diskList.map(disk => (disk.diskName)), raidLevel: `raid${raid.raidLevel}`, stripeSize: `${raid.stripeSize / 1024}k` })) });
                }
            }
            return param;
        };
        let metadata = { type: 'meta', hosts: handleServiceParam(enableCustomRAID ? customRAID : recommendedRAID, 'metadata') };
        let storage = { type: 'storage', hosts: handleServiceParam(enableCustomRAID ? customRAID : recommendedRAID, 'storage') };
        let mgmt = { type: 'mgmt', hosts: managementServerIPs.map((ip, index) => ({ ip, heartBeatIp: enableHA ? hbIPs[index] : '' })), floatIp: enableHA ? floatIPs[0] : '' };
        let client = { type: 'client', hosts: clientIPs.map(ip => ({ ip })) };
        let orcafsParam = [metadata, storage, mgmt, client];
        return { mongodbParam, orcafsParam, nodeList, enableCreateBuddyGroup };
    },
    async initMongoDB(param) {
        let { ipList, replicaSet } = param;
        if (!replicaSet) {
            let command = `${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --fork`;
            await promise.runCommandInPromise(command);
            await promise.runCommandInPromise(`sed -i "/MongoDB/ a ${command}" /etc/rc.local`);
        } else {
            let command = `${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --replSet ${config.database.replicaSet} --bind_ip_all --fork`;
            let conf = { _id: config.database.replicaSet, members: ipList.map((ip, index) => ({ _id: index, host: ip, priority: 2 - index })) };
            await promise.writeFileInPromise('/tmp/.initiatedb.js', `rs.initiate(${JSON.stringify(conf)})`);
            for (let ip of ipList) {
                await promise.runCommandInRemoteNodeInPromise(ip, command);
                await promise.runCommandInRemoteNodeInPromise(ip, `sed -i "/mongod/d" /etc/rc.local`);
                await promise.runCommandInRemoteNodeInPromise(ip, `sed -i "/MongoDB/ a ${command}" /etc/rc.local`);
            }
            await promise.runCommandInPromise(`${config.database.bin}/mongo /tmp/.initiatedb.js`);
            await promise.runCommandInPromise('sleep 20');
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
        await mongoose.connect(`mongodb://localhost/${config.database.name}`);
        for (let i of Object.keys(param)) {
            await database.addSetting({ key: config.setting[i], value: param[i] });
        }
        await database.addUser({ username: 'admin', password: handler.md5('123456') });
        await database.addLocalAuthUserGroup({ name: 'everyone', description: 'everyone' });
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
    async restartServer(ipList) {
        let command = 'service orcafs-gui restart';
        for (let ip of ipList.reverse()) {
            await promise.runCommandInRemoteNodeInPromise(ip, command);
        }
    },
    async reInitMongoDB(ipList) {
        await promise.runCommandInPromise('killall mongod');
        let command = `${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --replSet ${config.database.replicaSet} --bind_ip_all --fork`;
        let conf = { _id: config.database.replicaSet, members: ipList.map((ip, index) => ({ _id: index, host: ip, priority: 2 - index })) };
        await promise.writeFileInPromise('/tmp/.initiatedb.js', `rs.initiate(${JSON.stringify(conf)})`);
        for (let ip of ipList) {
            await promise.runCommandInRemoteNodeInPromise(ip, command);
            await promise.runCommandInRemoteNodeInPromise(ip, `sed -i "/mongod/d" /etc/rc.local`);
            await promise.runCommandInRemoteNodeInPromise(ip, `sed -i "/MongoDB/ a ${command}" /etc/rc.local`);
        }
        await promise.runCommandInPromise(`${config.database.bin}/mongo /tmp/.initiatedb.js`);
        await promise.runCommandInPromise('sleep 20');
        await mongoose.connect(`mongodb://localhost/${config.database.name}`);
    }
};
module.exports = model;