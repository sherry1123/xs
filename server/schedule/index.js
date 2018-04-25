const task = require('../service/task');
const snapshot = require('../service/snapshot');
const CronJob = require('cron').CronJob;

new CronJob('*/15 * * * * *', async () => {
    await task.getHardware();
}, null, true);

new CronJob('0 * * * * *', async () => {
    !snapshot.getRollbackStatus() && await task.createSnapshot();
}, null, true);

new CronJob('0 */5 * * * *', async () => {
    await task.sendChangePasswordMessage();
}, null, true);