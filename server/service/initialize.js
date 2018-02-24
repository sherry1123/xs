const config = require('../config');
const mongoose = require('../model');
const promise = require('../module/promise');
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
            i ? await promise.runCommandInRemoteNode(ipList[i], command) : await promise.runCommandInPromise(command);
            conf.members.push({_id: i, host: ipList[i]});
        }
        await promise.writeFileInPromise('/tmp/initiatedb.js', `rs.initiate(${JSON.stringify(conf)})`);
        await promise.runCommandInPromise(`${config.database.bin}/mongo /tmp/initiatedb.js`);
        mongoose.connect(`mongodb://localhost/${config.database.name}`);
    },
    async antiInitMongoDB(ipList) {
        let command = `ps aux|grep mongod|grep grep -v|awk '{print $2}'|xargs sudo kill -9 && sudo rm -rf ${config.database.dbpath}/*`;
        for (let i = 0; i < ipList.length; i++) {
            i ? await promise.runCommandInRemoteNode(ipList[i], command) : await promise.runCommandInPromise(command); 
        }
    },
    async initOrcaFS(param) {
        //todo
    },
    async antiInitOrcaFS(param) {
        //todo
    }
}
module.exports = model;