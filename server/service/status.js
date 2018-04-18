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
            handler.error(1, error);
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
                handler.error(2, error);
            }
        }
        return result;
    },
    async sendEvent(param) {
        let api = 'http://localhost/api/receiveevent';
        let { channel, target, info } = param;
        for (let i in target) {
            target[i] = { name: target[i], result: Math.random() > 0.5 ? true : false };
        }
        await promise.runTimeOutInPromise(10);
        await request.post(api, { channel, code: target.filter(snapshot => (snapshot.result)).length === target.length ? 5 : 6, target, info }, {}, true);

    }
};
module.exports = model;