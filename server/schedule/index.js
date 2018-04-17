const service = require('../service');
const snapshot = require('../service/snapshot')
const CronJob = require('cron').CronJob;

new CronJob('*/15 * * * * *', async () => {
    await service.addHardware();
}, null, true);

new CronJob('0 * * * * *', async () => {
    await snapshot.runSnapshotTask();
}, null, true);