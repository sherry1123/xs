import {CronJob} from 'cron';
// import requests from './requests';

const fetchData = () => {

};

new CronJob('*/15 * * * * *', async () => {
    //
    fetchData();
}, null, true);