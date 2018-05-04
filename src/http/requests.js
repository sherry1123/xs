import {fetchGet, fetchPost} from './fetch';
import {lsGet} from '../services';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import generalAction from '../redux/actions/generalAction';
import metadataNodeAction from '../redux/actions/metadataNodeAction';
import storageNodeAction from '../redux/actions/storageNodeAction';
import managementAction from '../redux/actions/managementAction';
import snapshotAction from '../redux/actions/snapshotAction';
import shareAction from '../redux/actions/shareAction';
import fsOperationAction from '../redux/actions/fsOperationAction';

const requestMiddleWare = fn => {
    try {
        return fn();
    } catch (e){
        console.info('http request error: ' + (e.msg || 'no clear error message'));
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

    // user - login, logout, update
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

    // management
    getEventLogs (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/geteventlog');
            !!data && store.dispatch(managementAction.setSystemEventLogs(data));
        });
    },

    getAuditLogs (){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getauditlog');
            !!data && store.dispatch(managementAction.setSystemAuditLogs(data));
        });
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

    async rollbackSnapshot (snapshot){
        await fetchPost('/api/rollbacksnapshot', snapshot);
    },

    async deleteSnapshot (snapshot){
        await fetchPost('/api/deletesnapshot', snapshot);
    },

    async deleteSnapshotsInBatch (names){
        await fetchPost('/api/deletesnapshots', {names});
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
            let data = await fetchGet('/api/getsnapshottask');
            !!data && store.dispatch(snapshotAction.setSnapshotScheduleList(data));
        });
    },

    async createSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/createsnapshottask', snapshotSchedule);
    },

    async enableSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/enablesnapshottask', snapshotSchedule);
    },

    async disableSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/disablesnapshottask', snapshotSchedule);
    },

    async editSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/updatesnapshottask', snapshotSchedule);
    },

    async deleteSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/deletesnapshottask', snapshotSchedule);
    },

    async deleteSnapshotSchedulesInBatch (names){
        await fetchPost('/api/deletesnapshottasks', {names});
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

    // fs operation
    getEntryInfo (dir){
        requestMiddleWare(async () => {
            let data = await fetchGet('/api/getentryinfo', {dir});
            !!data && store.dispatch(fsOperationAction.setEntryInfo(data));
        });
    },

    async getFiles (dir){
        let data = await fetchGet('api/getfiles', {dir});
        !!data && store.dispatch(fsOperationAction.setFiles(data));
    },

    async saveEntryInfo (data){
        await fetchPost('/api/setpattern', data)
    },

};