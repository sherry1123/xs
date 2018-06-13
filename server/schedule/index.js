const cron = require('cron');
const task = require('../service/task');
const status = require('../service/status');
const init = require('../service/initialize');
const doOrNotDo = async () => (status.getInitStatus() && await init.getMongoDBMasterOrNot() && !status.getDeinitStatus() && !status.getReinitStatus() && !status.getRollbackStatus());

new cron.CronJob('0 * * * * *', async () => {
    await doOrNotDo() && await task.createSnapshot();;
}, null, true);

new cron.CronJob('*/15 * * * * *', async () => {
    await doOrNotDo() && await task.getClusterThroughputAndIops();;
}, null, true);

new cron.CronJob('*/15 * * * * *', async () => {
    await doOrNotDo() && await task.getNodeCpuAndMemory();;
}, null, true);

new cron.CronJob('*/15 * * * * *', async () => {
    await doOrNotDo() && await task.getNodeThroughputAndIops();;
}, null, true);

new cron.CronJob('0 */5 * * * *', async () => {
    await doOrNotDo() && await task.sendChangePasswordMessage();
}, null, true);