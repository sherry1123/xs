const config = require('../config');
const mongoose = require('mongoose');
const handler = require('./handler');
const promise = require('./promise');
const getMongoDBType = async () => {
    let command = `${config.database.bin}/mongo --quiet --eval "rs.status().ok"`;
    return Number(await promise.runCommandInPromise(command));
};
const getMongoDBReplSetConfig = async () => {
    let command = `${config.database.bin}/mongo --quiet --eval "db.isMaster().hosts"`;
    return JSON.parse(await promise.runCommandInPromise(command));
};
(async () => {
    try {
        if (config.env.name && config.env.initialize === 'true' && config.env.mgmt === 'true') {
            if (await getMongoDBType()) {
                let ipList = await getMongoDBReplSetConfig();
                await mongoose.connect(`mongodb://${String(ipList)}/${config.database.name}?replicaSet=${config.database.replicaSet}`);
            } else {
                await mongoose.connect(`mongodb://localhost/${config.database.name}`);
            }
        }
    } catch (error) {
        handler.error(23, error);
    }
})();
module.exports = mongoose;