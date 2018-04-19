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
        let initStatus = init.getInitStatus();
        if (!initStatus) {
            result = true;
        } else {
            try {
                result = await init.getMongoDBMasterOrNot();
            } catch (error) {
                handler.error(22, error);
            }
        }
        return result;
    },
    async sendEvent(param) {
        let { channel, target, info } = param;
        let receviceEventAPI = 'http://localhost/api/receiveevent';
        target = target.map(snapshot => ({name: snapshot, result: Math.random() > 0.5 ? true : false}));
        await promise.runTimeOutInPromise(10);
        await request.post(receviceEventAPI, { channel, code: target.filter(snapshot => (snapshot.result)).length === target.length ? 3 : 4, target, info }, {}, true);

    }
};
module.exports = model;