const cron = require('cron');
const task = require('../service/task');
const status = require('../service/status');
const init = require('../service/initialize');
const doOrNotDo = async () => (status.getInitStatus() && await init.getMongoDBMasterOrNot() && !status.getDeinitStatus() && !status.getRollbackStatus());

new cron.CronJob('0 * * * * *', async () => {
    await doOrNotDo() && await task.createSnapshot();;
}, null, true);

new cron.CronJob('0 */5 * * * *', async () => {
    await doOrNotDo() && await task.sendChangePasswordMessage();
}, null, true);