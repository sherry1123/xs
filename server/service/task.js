const email = require('./email');
const status = require('./status');
const database = require('./database');
const snapshot = require('./snapshot');
const handler = require('../module/handler');
const model = {
    async sendMail() {
        try {
            await email.sendMail();
        } catch (error) {
            handler.error(62, error);
        }
    },
    async createSnapshot() {
        try {
            await snapshot.runSnapshotSchedule();
        } catch (error) {
            handler.error(148, error);
        }
    },
    async sendChangePasswordMessage() {
        try {
            let [{ password }] = await database.getUser({ username: 'admin' });
            password === '123456' && await status.sendEvent('user', 21, { username: 'admin', password: '123456' }, false, true);
        } catch (error) {
            handler.error(52, error);
        }
    }
};
module.exports = model;