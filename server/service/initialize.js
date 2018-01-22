const config = require('../config');
const mongoose = require('../model');
const promise = require('../module/promise');
let init = false;
const model = {
    getInitStatus() {
        return init;
    },
    setInitStatus(status) {
        init = status
    },
    async initMongoDB(iplist) {
        let master = iplist[0];
        let slaves = iplist.splice(1, 3);
        let masterCmd = 'sudo mongod -f /usr/local/mongodb/mongodb.conf --master';
        let slaveCmd = `sudo mongod -f /usr/local/mongodb/mongodb.conf --slave --source ${master}:27017`;
        await promise.runCommandInPromise(masterCmd);
        for(let slave of slaves) {
            await promise.runCommandInRemoteNode(slave, slaveCmd);
        }
        mongoose.connect(`mongodb://localhost/${config.database.name}`);
    },
    async antiInitMongoDB() {
        let commands = ['sudo service mongodb stop', 'sudo rm -rf /usr/local/mongodb/data/db/*', 'sudo cp /usr/local/mongodb/mongodb.conf.bak /usr/local/mongodb/mongodb.conf'];
        for (let command of commands) {
            await promise.runCommandInPromise(command);
        }
    }
}
module.exports = model;