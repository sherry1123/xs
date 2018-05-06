const config = require('../config');
const init = require('./initialize');
const handler = require('../module/handler');
const promise = require('../module/promise');
const request = require('../module/request');
const model = {
    async getInitStatus() {
        let result = false;
        try {
            result = await init.getOrcaFSStatus();
        } catch (error) {
            handler.error(21, error);
        }
        init.setInitStatus(result);
        return result;
    },
    async isMaster() {
        let result = false;
        try {
            result = !init.getInitStatus() ? true : await init.getOrcaFSMasterOrNot() && await init.getMongoDBMasterOrNot();
        } catch (error) {
            handler.error(22, error);
        }
        return result;
    }
};
module.exports = model;