const config = require('../config');
const init = require('./initialize');
const handler = require('../module/handler');
const request = require('../module/request');
const model = {
    isMgmt() {
        return process.env.MGMT === 'true';
    },
    isMaster() {
        return process.env.MASTER === 'true';
    },
    getInitStatus() {
        return process.env.INITIALIZE === 'true';
    },
    setInitStatus(status) {
        process.env.INITIALIZE = status;
    },
    getDeinitStatus() {
        return process.env.DEINITIALIZE === 'true';
    },
    setDeinitStatus(status) {
        process.env.DEINITIALIZE = status;
    },
    getReinitStatus() {
        return process.env.REINITIALIZE === 'true';
    },
    setReinitStatus(status) {
        process.env.REINITIALIZE = status;
    },
    getRollbackStatus() {
        return process.env.ROLLBACK === 'true';
    },
    setRollbackStatus(status) {
        process.env.ROLLBACK = status;
    },
    async checkAllStatus() {
        let initialize = false;
        let mgmt = false;
        let master = false;
        try {
            initialize = await init.getOrcaFSStatus();
            mgmt = initialize ? await init.getOrcaFSMasterOrNot() : false;
            master = initialize ? await init.getOrcaFSMasterOrNot() && await init.getMongoDBMasterOrNot() : true;
        } catch (error) {
            handler.error(21, error);
        }
        return { initialize, mgmt, master };
    },
    async sendEvent(channel, code, target, result, notify) {
        await request.post(config.api.server.receiveevent, { channel, code, target, result, notify }, {}, true);
    }
};
module.exports = model;