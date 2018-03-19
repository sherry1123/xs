const config = require('../config');
const mongoose = require('../model');
const promise = require('../module/promise');
const request = require('../module/request');
const database = require('../service/database');
const filesystem = require('../service/filesystem');
let init = false;
const model = {
    getInitStatus() {
        return init;
    },
    setInitStatus(status) {
        init = status;
    },
    async getMongoDBStatus() {
        let command = `${config.database.bin}/mongo --quiet --eval "rs.status()"`;
        let result = false;
        try {
            result = String(await promise.runCommandInPromise(command)).includes('PRIMARY');
        } catch (error) {
            result = false;
        }
        return result;
    },
    async getOrcaFSStatus() {
        //todo
        let result = true;
        return result;
    },
    async getMongoDBMasterOrNot() {
        let command = `${config.database.bin}/mongo --quiet --eval "db.isMaster().ismaster"`;
        let result = false;
        result = String(await promise.runCommandInPromise(command)).replace('\n', '') === 'true';
        return result;
    },
    async getOrcaFSMasterOrNot() {
        //todo
    },
    async checkClusterEnv(ipList) {
        let result = {};
        for (let ip of ipList) {
            try {
                await request.get(`http://${ip}:3456/api/testapi`, false, {}, true);
                result[ip] = true;
            } catch (error) {
                result[ip] = false;
            }
        }
        return result;
    },
    async initMongoDB(param) {
        let { primary, secondary, arbiter, replicaSet } = param;
        if (!replicaSet) {
            let command = `sudo ${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --fork`;
            await promise.runCommandInPromise(command);
        } else {
            let command = `sudo ${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --replSet ${config.database.replicaSet} --fork`;
            let ipList = [primary, secondary, arbiter];
            let conf = {
                _id: config.database.replicaSet,
                members: []
            };
            for (let i = 0; i < ipList.length; i++) {
                i ? await promise.runCommandInRemoteNodeInPromise(ipList[i], command) : await promise.runCommandInPromise(command);
                conf.members.push(i === 2 ? { _id: i, host: ipList[i], arbiterOnly: true } : { _id: i, host: ipList[i], priority: 2 - i });
            }
            await promise.writeFileInPromise('/tmp/initiatedb.js', `rs.initiate(${JSON.stringify(conf)})`);
            await promise.runCommandInPromise(`${config.database.bin}/mongo /tmp/initiatedb.js`);
        }
    },
    async initOrcaFS(param) {
        //todo
        //let token = await filesystem.getToken();
        //let result = await request.post(config.api.orcafs.createcluster, param, token);
        //return result;
    },
    async getOrcaFSInitProgress() {
        //todo
        //let token = await filesystem.getToken();
        //let result = await request.get(config.api.orcafs.installstatus, '', token);
        //return result;
    },
    async updateNginxConfig(master) {
        let path = config.nginx.path;
        await promise.chmodFileInPromise(path, 777);
        let file = await promise.readFileInPromise(path);
        let data = file.replace(/127\.0\.0\.1/g, `${master}`).replace(/try_files\s\$uri\s\/index\.html;/, config.nginx.proxy);
        await promise.writeFileInPromise(path, data);
    },
    async saveInitInfo(ipList) {
        await promise.runCommandInPromise(`sleep 20`);
        await mongoose.connect(`mongodb://localhost/${config.database.name}`);
        await database.addSetting({ key: 'nodelist', value: ipList });
        await database.addUser({ username: 'admin', password: '123456' });
    },
    async antiInitMongoDB(ipList) {
        let command = `sudo killall mongod; sleep 5; sudo rm -rf ${config.database.dbpath}/*`;
        for (let i = 0; i < ipList.length; i++) {
            i ? await promise.runCommandInRemoteNodeInPromise(ipList[i], command) : await promise.runCommandInPromise(command);
        }
    },
    async antiInitOrcaFS(param) {
        //todo
    }
};
module.exports = model;