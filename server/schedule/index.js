const service = require('../service');
const CronJob = require('cron').CronJob;

new CronJob('*/15 * * * * *', async () => {
    await service.addHardware();
}, null, true);