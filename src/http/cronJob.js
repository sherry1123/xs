import {CronJob} from 'cron';
import httpRequests from './requests';
import routerPath from '../views/routerPath';
import {ckGet} from '../services';

const fetchDataPer15s = () => {
    let routerHash = window.location.hash;
    const main = routerPath.Main;

    // main
    if (routerHash.match(main)){
        httpRequests.getClusterInfo();
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

    // dashboard
    if (routerHash.match(main + routerPath.Dashboard)){
        httpRequests.getClusterTargets();
        httpRequests.getClusterThroughput();
        httpRequests.getClusterIOPS();
        httpRequests.getClusterPhysicalNodeList();
    }

    // data node
    if (routerHash.match(main + routerPath.DataNode)){
        httpRequests.getPhysicalNodeInfo();
        httpRequests.getPhysicalNodeTargets();
        httpRequests.getPhysicalNodeCPU();
        httpRequests.getPhysicalNodeDRAM();
        httpRequests.getPhysicalNodeTPS();
        httpRequests.getPhysicalNodeIOPS();
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

    // NFS share
    if (routerHash.match(main + routerPath.NFS)){
        httpRequests.getNFSShareList();
    }

    // CIFS share
    if (routerHash.match(main + routerPath.CIFS)){
        httpRequests.getCIFSShareList();
    }

    // local authentication user
    if (routerHash.match(main + routerPath.LocalAuthUser)){
        httpRequests.getLocalAuthUserList();
    }

    // local authentication user group
    if (routerHash.match(main + routerPath.LocalAuthUserGroup)){
        httpRequests.getLocalAuthUserGroupList();
    }

    // target
    if (routerHash.match(main + routerPath.Target)){
        httpRequests.getTargetList();
    }

    // buddy group
    if (routerHash.match(main + routerPath.BuddyGroup)){
        httpRequests.getBuddyGroupList();
    }

    // system log
    if (routerHash.match(main + routerPath.ManagementSystemLog)){
        httpRequests.getEventLogs();
        httpRequests.getAuditLogs();
    }
};

// get current system and login status
let isInitialized = ckGet('init');
let isLogin = ckGet('login');

if (isInitialized === 'true'){
    // request every 15 seconds
    new CronJob('*/15 * * * * *', async () => {
        fetchDataPer15s();
    }, null, true);

    // request immediately
    if (isLogin === 'true'){
        httpRequests.getFiles('/');
    }
}