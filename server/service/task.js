const email = require('./email');
const config = require('../config');
const database = require('./database');
const handler = require('../module/handler');
const request = require('../module/request');
const snapshot = require('./snapshot');
const model = {
    async getHardware() {
        let date = new Date();
        let api = config.api.agentd.hardware;
        try {
            let ipList = await database.getSetting({ key: 'nodelist' });
            let data = [];
            for (let ip of ipList) {
                let res = await request.get(api.replace('localhost', ip), {}, {}, true);
                data.push(res);
            }
            await database.addHardware({ date, ipList, data });
        } catch (error) {
            handler.error(20, error, api);
        }
    },
    async sendMail() {
        try {
            await email.sendMail();
        } catch (error) {
            handler.error(22, error);
        }
    },
    async createSnapshot() {
        try {
            await snapshot.runSnapshotTask();
        } catch (error) {
            handler.error(63, error);
        }
    }
};
module.exports = model;