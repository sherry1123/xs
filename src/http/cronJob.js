import {CronJob} from 'cron';
import httpRequests from './requests';
import routerPath from '../views/routerPath';

// load every 15 seconds
const fetchDataPer15s = () => {
    let routerHash = window.location.hash;
    const main = routerPath.Main;

    // metadata node
    if (routerHash.match(main + routerPath.MetadataNodes)){
        httpRequests.getMetadataNodeOverviewSummary();
        httpRequests.getMetadataNodeOverviewUserOperationStatics();
        httpRequests.getMetadataNodeDetailSummary();
    }

    // storage node
    if (routerHash.match(main + routerPath.StorageNodes)){
        httpRequests.getStorageNodeOverviewSummary();
        httpRequests.getStorageNodeOverviewThroughput();
        httpRequests.getStorageNodeDetailSummary();
        httpRequests.getStorageNodeDetailThroughput();
    }
};

new CronJob('*/15 * * * * *', async () => {
    fetchDataPer15s();
}, null, true);


// load immediately when access page
