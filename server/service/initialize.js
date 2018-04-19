const config = require('../config');
const mongoose = require('../model');
const promise = require('../module/promise');
const request = require('../module/request');
const database = require('../service/database');
const afterMe = require('../service/afterMe');
let init = false;
const model = {
    getInitStatus() {
        return init;
    },
    setInitStatus(status) {
        init = status;
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
        //todo
    },
    handleInitParam(param) {
        let { metadataServerIPs: meta, storageServerIPs: storage, clientIPs: client, managementServerIPs: mgmt, enableHA: HA, floatIPs: floatIP, hbIPs: heartbeatIP } = param;
        let mongodbParam = {};
        let orcafsParam = [];
        let nodelist = Array.from(new Set(mgmt.concat(meta, storage)));
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
        return { mongodbParam, orcafsParam, nodelist };
    },
    async initMongoDB(param) {
        let { primary, secondary, arbiter, replicaSet } = param;
        if (!replicaSet) {
            let command = `${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --fork`;
            await promise.runCommandInPromise(command);
            await promise.runCommandInPromise(`sed -i "/MongoDB/ a ${command}" /etc/rc.local`);
        } else {
            let command = `${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --replSet ${config.database.replicaSet} --fork`;
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
    async updateNginxConfig(master) {
        let path = config.nginx.path;
        await promise.chmodFileInPromise(path, 777);
        let file = await promise.readFileInPromise(path);
        let data = file.replace(/127\.0\.0\.1/g, `${master}`).replace(/try_files\s\$uri\s\/index\.html;/, config.nginx.proxy);
        await promise.writeFileInPromise(path, data);
    },
    async saveInitInfo(param) {
        await promise.runCommandInPromise('sleep 20');
        await mongoose.connect(`mongodb://localhost/${config.database.name}`);
        for (let i of Object.keys(param)) {
            await database.addSetting({ key: i, value: param[i] });
        }
        await database.addUser({ username: 'admin', password: '123456' });
        await database.addSetting({ key: 'snapshotsetting', value: config.snapshot });
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
    async restartServer(nodelist) {
        let command = 'service orcafs-gui restart';
        nodelist = nodelist.reverse();
        for (let i = 0; i < nodelist.length; i++) {
            i === nodelist.length - 1 ? await promise.runCommandInPromise(command) : await promise.runCommandInRemoteNodeInPromise(nodelist[i], command);
        }
    }
};
module.exports = model;