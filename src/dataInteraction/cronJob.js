import requests from './requests';
const CronJob = require('cron').CronJob;

const fetchData = () => {

};

new CronJob('*/15 * * * * *', async () => {
    //
    fetchData();
}, null, true);