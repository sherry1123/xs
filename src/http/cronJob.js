import {CronJob} from 'cron';
import requests from './requests';
import routerPath from '../views/routerPath';

// load every 15 seconds
const fetchDataPer15s = () => {
    let routerHash = window.location.hash;
    const main = routerPath.Main;

    // storage node
    if (routerHash.match(main + routerPath.StorageNodes)){
        requests.getStorageNodeOverviewSummary();
    }
};

new CronJob('*/15 * * * * *', async () => {
    fetchDataPer15s();
}, null, true);

// load every 60 seconds
const fetchDataPer60s = () => {
    let routerHash = window.location.hash;
    const main = routerPath.Main;

    // storage node
    if (routerHash.match(main + routerPath.StorageNodes)){
        requests.getStorageNodeOverviewThroughput();
    }
};

new CronJob('*/60 * * * * *', async () => {
    fetchDataPer60s();
}, null, true);


// load immediately when access page
