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
        httpRequests.getMetadataNodes();
        httpRequests.getStorageNodes();
    }

    // metadata node
    if (routerHash.match(main + routerPath.MetadataNodes)){
        httpRequests.getMetadataNodesStatics();
        httpRequests.getMetadataNodeDetailStatics();
    }

    // storage node
    if (routerHash.match(main + routerPath.StorageNodes)){
        httpRequests.getStorageNodesThroughput();
        httpRequests.getStorageNodeDiskStatus();
        httpRequests.getStorageNodeTargets();
        httpRequests.getStorageNodeDetailThroughput();
    }

    // snapshot
    if (routerHash.match(main + routerPath.Snapshot)){
        httpRequests.getSnapshotList();
        httpRequests.getSnapshotSetting();
    }

    // snapshot schedule
    if (routerHash.match(main + routerPath.SnapshotSchedule)){
        httpRequests.getSnapshotScheduleList();
    }

    // share
    if (routerHash.match(main + routerPath.Share)){
        httpRequests.getShareList();
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

// request something when access app
httpRequests.getFiles('/');