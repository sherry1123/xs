const config = require('../config');
const mongoose = require('../model');
const promise = require('../module/promise');
const request = require('../module/request');
const filesystem = require('../service/filesystem');
let init = false;
const model = {
    getInitStatus() {
        return init;
    },
    setInitStatus(status) {
        init = status;
    },
    async initMongoDB(ipList) {
        let command = `sudo ${config.database.bin}/mongod --dbpath ${config.database.dbpath} --logpath ${config.database.logpath} --replSet ${config.database.replicaSet} --fork`;
        let conf = {
            _id: config.database.replicaSet,
            members: []
        };
        for (let i = 0; i < ipList.length; i++) {
            i ? await promise.runCommandInRemoteNodeInPromise(ipList[i], command) : await promise.runCommandInPromise(command);
            conf.members.push({ _id: i, host: ipList[i] });
        }
        await promise.writeFileInPromise('/tmp/initiatedb.js', `rs.initiate(${JSON.stringify(conf)})`);
        await promise.runCommandInPromise(`${config.database.bin}/mongo /tmp/initiatedb.js`);
        await mongoose.connect(`mongodb://localhost/${config.database.name}`);
    },
    async antiInitMongoDB(ipList) {
        let command = `sudo killall mongod; sleep 5; sudo rm -rf ${config.database.dbpath}/*`;
        for (let i = 0; i < ipList.length; i++) {
            i ? await promise.runCommandInRemoteNodeInPromise(ipList[i], command) : await promise.runCommandInPromise(command);
        }
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
    async getMongoDBMasterOrNot() {
        let command = `${config.database.bin}/mongo --quiet --eval "db.isMaster().ismaster"`;
        let result = false;
        result = String(await promise.runCommandInPromise(command)).replace('\n', '') === 'true';
        return result;
    },
    async initOrcaFS(param) {
        //todo
        let token = await filesystem.getToken();
        let result = await request.post(config.api.orcafs.createcluster, param, token);
        return result;
    },
    async antiInitOrcaFS(param) {
        //todo
    },
    async getOrcaFSInitProgress() {
        //todo
        let token = filesystem.getToken();
        let result = await request.get(config.api.orcafs.installstatus, '', token);
        return result;
    },
    async getOrcaFSStatus() {
        //todo
        let result = true;
        return result;
    }
};
module.exports = model;