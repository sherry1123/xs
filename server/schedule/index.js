const service = require('../service');
const CronJob = require('cron').CronJob;

new CronJob('*/15 * * * * *', async () => {
    await service.addHardware();
}, null, true);

new CronJob('0 * * * * *', async () => {
    await service.runSnapshotTask();
}, null, true);