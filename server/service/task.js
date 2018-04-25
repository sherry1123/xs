const email = require('./email');
const config = require('../config');
const database = require('./database');
const snapshot = require('./snapshot');
const handler = require('../module/handler');
const request = require('../module/request');
const model = {
    async getHardware() {
        let date = new Date();
        let api = config.api.agentd.hardware;
        try {
            let ipList = await database.getSetting({ key: 'nodelist' });
            let data = [];
            for (let ip of ipList) {
                data.push(await request.get(api.replace('localhost', ip), {}, {}, true));
            }
            await database.addHardware({ date, ipList, data });
        } catch (error) {
            handler.error(72, error, api);
        }
    },
    async sendMail() {
        try {
            await email.sendMail();
        } catch (error) {
            handler.error(62, error);
        }
    },
    async createSnapshot() {
        try {
            await snapshot.runSnapshotTask();
        } catch (error) {
            handler.error(148, error);
        }
    },
    async sendChangePasswordMessage() {
        try {
            let [{ password }] = await database.getUser({ username: 'admin' });
            password === '123456' && await request.post(config.api.server.receiveevent, { channel: 'user', code: 21, target: { username: 'admin', password: '123456' }, info: {} }, {}, true);
        } catch (error) {
            handler.error(52, error);
        }
    }
};
module.exports = model;