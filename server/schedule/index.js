const task = require('../service/task');
const init = require('../service/initialize');
const snapshot = require('../service/snapshot');
const CronJob = require('cron').CronJob;
const doOrNotDo = () => (!init.getAntiInitStatus() && !snapshot.getRollbackStatus());

new CronJob('*/15 * * * * *', async () => {
    doOrNotDo() && await task.getHardware();
}, null, true);

new CronJob('0 * * * * *', async () => {
    doOrNotDo() && await task.createSnapshot();
}, null, true);

new CronJob('0 */5 * * * *', async () => {
    doOrNotDo() && await task.sendChangePasswordMessage();
}, null, true);