import {CronJob} from 'cron';
import httpRequests from './requests';
import routerPath from '../views/routerPath';
import {ckGet} from '../services';

const fetchDataPer15s = () => {
    const routerHash = window.location.hash;
    const main = routerPath.Main; // as '/'

    // main
    if (routerHash.match(main)){
        // get cluster information and system version
        httpRequests.getClusterInfo();
        // check service status and prompt user if there is any change on them
        httpRequests.getMetadataNodes();
        httpRequests.getStorageNodes();
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

    // service and client
    if (routerHash.match(main + routerPath.ServiceAndClient)){
        httpRequests.getClusterServiceAndClientIPs();
    }

    //storage pool
	if (routerHash.match(main + routerPath.StoragePool)){
		httpRequests.getStoragePoolList();
	}

	/*
    // snapshot
    if (routerHash.match(main + routerPath.Snapshot)){
        httpRequests.getSnapshotList();
        httpRequests.getSnapshotSetting();
    }

    // snapshot schedule
    if (routerHash.match(main + routerPath.SnapshotSchedule)){
        httpRequests.getSnapshotScheduleList();
    }
    */

    // nas server
    if (routerHash.match(main + routerPath.NASServer)){
        httpRequests.getNASServerList();
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
    if (routerHash.match(main + routerPath.SystemLog)){
        httpRequests.getEventLogs();
        httpRequests.getAuditLogs();
    }
};

let runCronJob = () => {
    // get current system and login status
    const isInitialized = ckGet('init');
    const isLogin = ckGet('login');
    const isDeInit = ckGet('deinit');
    const isReInit = ckGet('reinit');
    const isRollingBack = ckGet('rollbacking');

    if (isInitialized === 'true'){
        // request every 15 seconds
        new CronJob('*/15 * * * * *', async () => {
             fetchDataPer15s();
        }, null, true);

        // request immediately
        if (isLogin === 'true' && isDeInit !== 'true' && isReInit !== 'true' && isRollingBack !== 'true'){
            // for target, service and client pages, they need the services and clients info in cluster immediately
            httpRequests.getClusterServiceAndClientIPs();
        }
    }
};

export default runCronJob;