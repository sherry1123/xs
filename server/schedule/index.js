const cron = require('cron');
const task = require('../service/task');
const init = require('../service/initialize');
const snapshot = require('../service/snapshot');
const doOrNotDo = () => (!init.getAntiInitStatus() && !snapshot.getRollbackStatus());

new cron.CronJob('*/15 * * * * *', async () => {
    doOrNotDo() && await task.getHardware();
}, null, true);

new cron.CronJob('0 * * * * *', async () => {
    doOrNotDo() && await task.createSnapshot();
}, null, true);

new cron.CronJob('0 */5 * * * *', async () => {
    doOrNotDo() && await task.sendChangePasswordMessage();
}, null, true);