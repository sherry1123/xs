const os = require('os');
const database = require('./database');
const handler = require('../module/handler');
const model = {
    async event(param) {
        let { time = new Date(), node = os.hostname(), desc, level = 1, source = 'orcafs-gui', read = false } = param;
        try {
            await database.addEventLog({ time, node, desc, level, source, read });
        } catch (error) {
            handler.error(15, error, param);
        }
    },
    async audit(param) {
        let { time = new Date(), user, group = 'admin', desc, level = 1, ip = '127.0.0.1' } = param;
        try {
            await database.addAuditLog({ time, user, group, desc, level, ip });
        } catch (error) {
            handler.error(18, error, param);
        }
    }
};
module.exports = model;