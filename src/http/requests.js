import {fetchGet, fetchPost} from './fetch';
import {lsGet} from '../services';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import generalAction from '../redux/actions/generalAction';
import metadataNodeAction from '../redux/actions/metadataNodeAction';
import storageNodeAction from '../redux/actions/storageNodeAction';
import dashboardAction from '../redux/actions/dashboardAction';
import dataNodeAction from '../redux/actions/dataNodeAction';
import systemLogAction from '../redux/actions/systemLogAction';
import snapshotAction from '../redux/actions/snapshotAction';
import shareAction from '../redux/actions/shareAction';
import localAuthUserAction from '../redux/actions/localAuthUserAction';
import targetAction from '../redux/actions/targetAction';

const requestMiddleWare = fn => {
    try {
        return fn();
    } catch (e){
        let {language} = store.getState();
        console.info('http request error: ' + (e.msg || language === 'chinese' ? '无明确错误信息' : 'no clear error message'));
    }
};

export default  {
    // redux store check
    checkStoreIsReady (){
        return new Promise(resolve => {
            let timer = setInterval(() => {
                if (store){
                    clearInterval(timer);
                    resolve();
                }
            }, 1000);
        });
    },

    // synchronized system status browser cookie with http server
    async syncUpSystemStatus (){
        await fetchPost('/api/syncsystemstatus');
    },

    // initialize
    getNodeDisksByNodeIP (ip){
        return requestMiddleWare(async () => await fetchGet('/api/getdisklist', {ip}));
    },

    startInitialization (config){
        requestMiddleWare(async () => await fetchPost('/api/init', config));
    },

    getDefaultUser (){
        requestMiddleWare(async () => {
            let data = await fetchPost('/api/getuser');
            !!data && store.dispatch(initializeAction.setDefaultUser(data[0]));
        });
    },

    checkIPs (IPs){
        return requestMiddleWare(async () => await fetchPost('/api/checkclusterenv', IPs));
    },

    getRecommendedRIAD (metadataServerIPs, storageServerIPs){
        requestMiddleWare(async () => {
            let data = await fetchPost('/api/getraidrecommendedconfiguration', {metadataServerIPs, storageServerIPs});
            console.info('recommended RAID config', data);
            !!data && store.dispatch(initializeAction.setRecommendedRAID(data));
        });
    },

    // user login, logout, update
    async login (user){
        return await fetchPost('/api/login', user);
    },

    async logout (user){
        return await fetchPost('/api/logout', user);
    },

    async updateUser (user){
        await fetchPost('/api/updateuser', user);
    },

    // main
    // known problems
    getKnownProblems (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getknownproblems');
            !!data && store.dispatch(generalAction.setKnownProblems(data));
        });
    },

    // metadata node
    getMetadataNodes (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getmetanodestatus');
            !!data && store.dispatch(metadataNodeAction.setMetadataNodes(data));
        });
    },

    getMetadataNodesStatics (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getusermetastats', {nodeId: 0});
            !!data && store.dispatch(metadataNodeAction.setMetadataNodeOverviewUserOperationStatics(data));
        });
    },

    getMetadataNodeDetailStatics ({nodeId} = (lsGet('currentMetadataNode') || {})){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getusermetastats', {nodeId});
            !!data && store.dispatch(metadataNodeAction.setMetadataNodeDetailUserOperationStatics(data));
        });
    },

    // storage node
    getStorageNodes (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getstoragenodestatus');
            !!data && store.dispatch(storageNodeAction.setStorageNodes(data));
        });
    },

    getStorageNodeDiskStatus (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getstoragediskspace');
            !!data && store.dispatch(storageNodeAction.setStorageNodeDiskStatus(data));
        });
    },

    getStorageNodesThroughput (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getstoragethroughput', {nodeId: 0});
            !!data && store.dispatch(storageNodeAction.setStorageNodeOverviewThroughput(data));
        });
    },

    getStorageNodeTargets ({nodeId} = (lsGet('currentStorageNode') || {})){
        if (!!nodeId){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getstoragetarget', {nodeId});
                !!data && store.dispatch(storageNodeAction.setStorageNodeDetailTargets(data));
            });
        }
    },

    getStorageNodeDetailThroughput ({nodeId} = (lsGet('currentStorageNode') || {})){
        if (!!nodeId){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getstoragethroughput', {nodeId});
                !!data && store.dispatch(storageNodeAction.setStorageNodeDetailThroughput(data));
            });
        }
    },

    // dashboard and cluster info
    getClusterInfo (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclusterinfo');
            if (!!data){
                store.dispatch(dashboardAction.setClusterInfo(data));
                store.dispatch(generalAction.setVersion(data.version));
            }
        });
    },

    getClusterTargets (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclustertarget', {ranking: true});
            !!data && store.dispatch(dashboardAction.setClusterTargets(data));
        });
    },

    getClusterThroughput (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclusterthroughput');
            !!data && store.dispatch(dashboardAction.setClusterThroughput(data));
        });
    },

    getClusterIOPS (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclusteriops');
            !!data && store.dispatch(dashboardAction.setClusterIOPS(data));
        });
    },

    getClusterPhysicalNodeList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getnodelist');
            !!data && store.dispatch(dashboardAction.setClusterPhysicalNodeList(data));
        });
    },

    getClusterServiceAndClientIPs (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclusterserviceandclientip');
            !!data && store.dispatch(dashboardAction.setClusterServiceAndClientIPs(data));
        });
    },

    // data node
    getPhysicalNodeInfo ({hostname} = (lsGet('currentPhysicalNode') || {})){
        if (!!hostname){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getnodeservice', {hostname});
                !!data && store.dispatch(dataNodeAction.setPhysicalNodeInfo(data));
            });
        }
    },

    getPhysicalNodeTargets ({hostname} = (lsGet('currentPhysicalNode') || {})){
        if (!!hostname){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getnodetarget', {hostname});
                !!data && store.dispatch(dataNodeAction.setPhysicalNodeTargets(data));
            });
        }
    },
    getPhysicalNodeCPU ({hostname} = (lsGet('currentPhysicalNode') || {})){
        if (!!hostname){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getnodecpu', {hostname});
                !!data && store.dispatch(dataNodeAction.setPhysicalNodeCPU(data));
            });
        }
    },

    getPhysicalNodeDRAM ({hostname} = (lsGet('currentPhysicalNode') || {})){
        if (!!hostname){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getnodememory', {hostname});
                !!data && store.dispatch(dataNodeAction.setPhysicalNodeRAM(data));
            });
        }
    },

    getPhysicalNodeTPS ({hostname} = (lsGet('currentPhysicalNode') || {})){
        if (!!hostname){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getnodethroughput', {hostname});
                !!data && store.dispatch(dataNodeAction.setPhysicalNodeTPS(data));
            });
        }
    },

    getPhysicalNodeIOPS ({hostname} = (lsGet('currentPhysicalNode') || {})){
        if (!!hostname){
            requestMiddleWare(async () => {
                let data = await fetchGet('/api/getnodeiops', {hostname});
                !!data && store.dispatch(dataNodeAction.setPhysicalNodeIOPS(data));
            });
        }
    },

    // system log
    getEventLogs (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/geteventlog');
            !!data && store.dispatch(systemLogAction.setSystemEventLogs(data));
        });
    },

    getAuditLogs (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getauditlog');
            !!data && store.dispatch(systemLogAction.setSystemAuditLogs(data));
        });
    },

    // service and client
    async createMetadataServiceToCluster (service){
        await fetchPost('/api/addmetadatatocluster', service);
    },

    async createStorageServiceToCluster (service){
        await fetchPost('/api/addstoragetocluster', service);
    },

    async createManagementServiceToCluster (service){
        await fetchPost('/api/addmanagementtocluster', service);
    },

    async createClientToCluster (client){
        await fetchPost('/api/addclienttocluster', client);
    },

    // snapshot
    getSnapshotList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getsnapshot');
            !!data && store.dispatch(snapshotAction.setSnapshotList(data));
        });
    },

    async createSnapshot (snapshot){
        await fetchPost('/api/createsnapshot', snapshot);
    },

    async updateSnapshot (snapshot){
        await fetchPost('/api/updatesnapshot', snapshot);
    },

    async rollbackSnapshot (snapshot){
        await fetchPost('/api/rollbacksnapshot', snapshot);
    },

    async deleteSnapshot (snapshot){
        await fetchPost('/api/deletesnapshot', snapshot);
    },

    async deleteSnapshotsInBatch (names){
        await fetchPost('/api/batchdeletesnapshot', {names});
    },

    getSnapshotSetting (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getsnapshotsetting');
            store.dispatch(snapshotAction.setSnapshotSetting(data));
        });
    },

    async updateSnapshotSetting (setting){
        await fetchPost('/api/updatesnapshotsetting', setting);
    },

    // snapshot schedule
    getSnapshotScheduleList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getsnapshotschedule');
            !!data && store.dispatch(snapshotAction.setSnapshotScheduleList(data));
        });
    },

    async createSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/createsnapshotschedule', snapshotSchedule);
    },

    async enableSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/enablesnapshotschedule', snapshotSchedule);
    },

    async disableSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/disablesnapshotschedule', snapshotSchedule);
    },

    async updateSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/updatesnapshotschedule', snapshotSchedule);
    },

    async deleteSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/deletesnapshotschedule', snapshotSchedule);
    },

    async deleteSnapshotSchedulesInBatch (names){
        await fetchPost('/api/batchdeletesnapshotschedule', {names});
    },

    // share
    getShareList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getnasexport');
            !!data && store.dispatch(shareAction.setShareList(data));
        });
    },

    async createShare (nasExport){
        await fetchPost('/api/createnasexport', nasExport);
    },

    async updateShare (nasExport){
        await fetchPost('/api/updatenasexport', nasExport);
    },

    async deleteShare (nasExport){
        await fetchPost('/api/deletenasexport', nasExport);
    },

    // NAS server
    async getNASServerList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getnasserver');
            !!data && store.dispatch(shareAction.setNASServerList(data));
        });
    },

    async getClientListForNASServer (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclient');
            !!data && store.dispatch(shareAction.setClientListForNASServer(data));
        });
    },

    async createNASServer (NASServer){
        await fetchPost('/api/createnasserver', NASServer);
    },

    async updateNASServer (NASServer){
        await fetchPost('/api/updatenasserver', NASServer);
    },

    // NFS share
    async getNFSShareList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getnfsshare');
            !!data && store.dispatch(shareAction.setNFSList(data));
        });
    },

    async createNFSShare (shareData){
        await fetchPost('/api/createnfsshare', shareData);
    },

    async updateNFSShare (shareData){
        await fetchPost(' /api/updatenfsshare', shareData);
    },

    async deleteNFSShare (shareData){
        await fetchPost('/api/deletenfsshare', shareData);
    },

    async deleteNFSShareInBatch (paths){
        await fetchPost('/api/batchdeletenfsshare', {paths});
    },

    // NFS share client
    async getClientListByNFSSharePath (path){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclientinnfsshare', {path});
            !!data && store.dispatch(shareAction.setClientListOfNFS(data));
        });
    },

    async createClientInNFSShare (client){
        await fetchPost('/api/createclientinnfsshare', client);
    },

    async updateClientInNFSShare (client){
        await fetchPost('/api/updateclientinnfsshare', client);
    },

    async deleteClientInNFSShare (client){
        await fetchPost('/api/deleteclientinnfsshare', client);
    },

    // CIFS share
    async getCIFSShareList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getcifsshare');
            !!data && store.dispatch(shareAction.setCIFSList(data));
        });
    },

    async createCIFSShare (shareData){
        await fetchPost('/api/createcifsshare', shareData);
    },

    async updateCIFSShare (shareData){
        await fetchPost('/api/updatecifsshare', shareData);
    },

    async deleteCIFSShare (shareData){
        await fetchPost('/api/deletecifsshare', shareData);
    },

    async deleteCIFSShareInBatch (shares){
        await fetchPost('/api/batchdeletecifsshare', {shares});
    },

    async getLocalAuthUserOrGroupListByCIFSShareName (shareName){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getuserorgroupfromcifsshare', {shareName});
            !!data && store.dispatch(shareAction.setLocalAuthUserOrGroupListOfCIFS(data));
        });
    },

    async addLocalAuthUserOrGroupToCIFSShare (shareName, sharePath, items){
        await fetchPost('/api/adduserorgrouptocifsshare', {shareName, sharePath, items});
    },

    async updateLocalAuthUserOrGroupInCIFSShare (item){
        await fetchPost('/api/updateuserorgroupincifsshare', item);
    },

    async removeLocalAuthUserOrGroupFromCIFSShare (item){
        await fetchPost('/api/removeuserorgroupfromcifsshare', item);
    },

    // local authentication user
    async getLocalAuthUserList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getlocalauthuser');
            !!data && store.dispatch(localAuthUserAction.setLocalAuthUserList(data));
        });
    },

    async createLocalAuthUser (userData){
        await fetchPost('/api/createlocalauthuser', userData);
    },

    async updateLocalAuthUser (userData){
        await fetchPost('/api/updatelocalauthuser', userData);
    },

    async deleteLocalAuthUser (userData){
        await fetchPost('/api/deletelocalauthuser', userData);
    },

    async deleteLocalAuthUserInBatch (names){
        await fetchPost('/api/batchdeletelocalauthuser', {names});
    },

    // local authentication user group
    async getLocalAuthUserGroupList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getlocalauthusergroup');
            !!data && store.dispatch(localAuthUserAction.setLocalAuthUserGroupList(data));
        });
    },

    async createLocalAuthUserGroup (groupData){
        await fetchPost('/api/createlocalauthusergroup', groupData);
    },

    async updateLocalAuthUserGroup (groupData){
        await fetchPost('/api/updatelocalauthusergroup', groupData);
    },

    async deleteLocalAuthUserGroup (groupData){
        await fetchPost('/api/deletelocalauthusergroup', groupData);
    },

    async getLocalAuthUserListByGroupName (groupName){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getlocalauthuserfromgroup', {groupName});
            !!data && store.dispatch(localAuthUserAction.setLocalAuthUserListOfGroup(data));
        });
    },

    async addLocalAuthUserToGroup (groupName, names){
        await fetchPost('/api/addlocalauthusertogroup', {groupName, names});
    },

    async removeLocalAuthUserFromGtoup (userData){
        await fetchPost('/api/removelocalauthuserfromgroup', userData);
    },

    // target and buddy group
    async getTargetList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getclustertarget', {ranking: false});
            !!data && store.dispatch(targetAction.setTargetList(data));
        });
    },

    async createTarget (target){
        await fetchPost('/api/createtarget', {target});
    },

    async getBuddyGroupList (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getbuddygroup');
            !!data && store.dispatch(targetAction.setBuddyGroupList(data));
        });
    },

    async createBuddyGroup (buddyGroups){
        await fetchPost('/api/createbuddygroup', {buddyGroups});
    },

    // fs operation
    getEntryInfo (dir){
        return requestMiddleWare(async () => await fetchGet('/api/getentryinfo', {dir}));
    },

    async getFiles (dir){
        return await fetchGet('api/getfiles', {dir});
    },

    async saveEntryInfo (data){
        await fetchPost('/api/setpattern', data)
    },

};