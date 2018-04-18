import {fetchGet, fetchPost, fetchMock, lsGet} from '../services';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import generalAction from '../redux/actions/generalAction';
import metadataNodeAction from '../redux/actions/metadataNodeAction';
import storageNodeAction from '../redux/actions/storageNodeAction';
import managementAction from '../redux/actions/managementAction';
import snapshotAction from '../redux/actions/snapshotAction';
import shareAction from '../redux/actions/shareAction';
import fsOperationAction from '../redux/actions/fsOperationAction';

const errorHandler = e => {
    console.info('http request error: ' + (e.msg || 'no clear error message'));
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
    async startInitialization (config){
        try {
            // await fetchPost('/api/testapi', config);
            await fetchPost('/api/init', config);
        } catch (e){
            errorHandler(e);
        }
    },

    async getDefaultUser (){
        try {
            let data = await fetchPost('/api/getuser');
            store.dispatch(initializeAction.setDefaultUser(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async checkIPs (IPs){
        try {
            await this.checkStoreIsReady();
            return await fetchMock(IPs);
        } catch (e){
            errorHandler(e);
        }
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
    async getKnownProblems (){
        try {
            let data = await fetchGet('/api/getknownproblems');
            store.dispatch(generalAction.setKnownProblems(data));
        } catch (e){
            errorHandler(e);
        }
    },

    // metadata node
    async getMetadataNodeOverviewSummary (){
        try {
            let data = await fetchGet('/api/getmetanodestatus');
            store.dispatch(metadataNodeAction.setMetadataNodeOverviewSummary(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getMetadataNodeOverviewUserOperationStatics (){
        try {
            let data = await fetchGet('/api/getusermetastats', {nodeId: 0});
            store.dispatch(metadataNodeAction.setMetadataNodeOverviewUserOperationStatics(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getMetadataNodeDetailSummary ({hostname, nodeId} = (lsGet('currentMetadataNode') || {})){
        if (!!hostname){
            try {
                let data = await fetchGet('/api/getmetanodesummary', {hostname, nodeId});
                store.dispatch(metadataNodeAction.setMetadataNodeDetailSummary(data));
            } catch (e){
                errorHandler(e);
            }
        }
    },

    async getMetadataNodeDetailUserOperationStatics ({nodeId} = (lsGet('currentMetadataNode') || {})){
        try {
            let data = await fetchGet('/api/getusermetastats', {nodeId});
            store.dispatch(metadataNodeAction.setMetadataNodeDetailUserOperationStatics(data));
        } catch (e){
            errorHandler(e);
        }
    },

    // storage node
    async getStorageNodeOverviewSummary (){
        try {
            let data = await fetchGet('/api/getstoragenodestatus');
            store.dispatch(storageNodeAction.setStorageNodeOverviewSummary(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getStorageNodeDiskStatus (){
        try {
            let data = await fetchGet('/api/getstoragediskspace');
            store.dispatch(storageNodeAction.setStorageNodeDiskStatus(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getStorageNodeOverviewThroughput (){
        try {
            let data = await fetchGet('/api/getstoragenodesthroughput');
            store.dispatch(storageNodeAction.setStorageNodeOverviewThroughput(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getStorageNodeTargets ({nodeId} = (lsGet('currentStorageNode') || {})){
        if (!!nodeId){
            try {
                let data = await fetchGet('/api/getstoragetarget', {nodeId});
                store.dispatch(storageNodeAction.setStorageNodeDetailTargets(data));
            } catch (e){
                errorHandler(e);
            }
        }
    },

    async getStorageNodeDetailThroughput ({hostname, nodeId} = (lsGet('currentStorageNode') || {})){
        if (!!hostname){
            try {
                let data = await fetchGet('/api/getstoragenodethroughput', {node: hostname, nodeNumID: nodeId});
                store.dispatch(storageNodeAction.setStorageNodeDetailThroughput(data));
            } catch (e){
                errorHandler(e);
            }
        }
    },

    // management
    async getEventLogs (){
        try {
            let data = await fetchGet('/api/geteventlog');
            store.dispatch(managementAction.setSystemEventLogs(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getAuditLogs (){
        try {
            let data = await fetchGet('/api/getauditlog');
            store.dispatch(managementAction.setSystemAuditLogs(data));
        } catch (e){
            errorHandler(e);
        }
    },

    // snapshot
    async getSnapshotList (){
        try {
            let data = await fetchGet('/api/getsnapshot');
            store.dispatch(snapshotAction.setSnapshotList(data));
        } catch (e){
            errorHandler(e);
        }
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

    // snapshot schedule
    async getSnapshotScheduleList (){
        try {
            let data = await fetchGet('/api/getsnapshottask');
            store.dispatch(snapshotAction.setSnapshotScheduleList(data));
        } catch (e){
            errorHandler(e);
        }
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

    async deleteSnapshotSchedule (snapshotSchedule){
        await fetchPost('/api/deletesnapshottask', snapshotSchedule);
    },

    async deleteSnapshotSchedulesInBatch (names){
        await fetchPost('/api/deletesnapshotschedules', {names});
    },

    // share
    async getShareList (){
        try {
            let data = await fetchGet('/api/getnasexport');
            store.dispatch(shareAction.setShareList(data));
        } catch (e){
            errorHandler(e);
        }
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
    async getEntryInfo (dir){
        try {
            let data = await fetchGet('/api/getentryinfo', {dir});
            store.dispatch(fsOperationAction.setEntryInfo(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getFiles (dir){
        let data = await fetchGet('api/getfiles', {dir});
        store.dispatch(fsOperationAction.setFiles(data));
    },

    async saveEntryInfo (data){
        await fetchPost('/api/setpattern', data)
    },

};