const service = require('../service');
const snapshot = require('../service/snapshot')
const CronJob = require('cron').CronJob;

new CronJob('*/15 * * * * *', async () => {
    await service.runHardwareTask();
}, null, true);

new CronJob('0 * * * * *', async () => {
    !snapshot.getRollbackStatus() && await service.runSnapshotTask();
}, null, true);