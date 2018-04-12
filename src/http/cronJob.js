import {CronJob} from 'cron';
import httpRequests from './requests';
import routerPath from '../views/routerPath';

// request every 15 seconds
const fetchDataPer15s = () => {
    let routerHash = window.location.hash;
    const main = routerPath.Main;

    // main
    if (routerHash.match(main)){
        // httpRequests.getKnownProblems();
        httpRequests.getMetadataNodeOverviewSummary();
        httpRequests.getStorageNodeOverviewSummary();
    }

    // metadata node
    if (routerHash.match(main + routerPath.MetadataNodes)){
        httpRequests.getMetadataNodeOverviewUserOperationStatics();
        httpRequests.getMetadataNodeDetailSummary();
        httpRequests.getMetadataNodeDetailUserOperationStatics();
    }

    // storage node
    if (routerHash.match(main + routerPath.StorageNodes)){
        httpRequests.getStorageNodeOverviewThroughput();
        httpRequests.getStorageNodeDetailSummary();
        httpRequests.getStorageNodeDetailThroughput();
    }

    // snapshot
    if (routerHash.match(main + routerPath.Snapshot)){
        httpRequests.getSnapshotList();
    }

    // nas
    if (routerHash.match(main + routerPath.Nas)){
        httpRequests.getNasExportList();
    }

    // management - system log
    if (routerHash.match(main + routerPath.ManagementSystemLog)){
        httpRequests.getEventLogs();
        httpRequests.getAuditLogs();
    }
};

new CronJob('*/15 * * * * *', async () => {
    fetchDataPer15s();
}, null, true);