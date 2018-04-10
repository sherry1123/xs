import {fetchGet, fetchPost, fetchMock, lsGet} from '../services';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import generalAction from '../redux/actions/generalAction';
import metadataNodeAction from '../redux/actions/metadataNodeAction';
import storageNodeAction from '../redux/actions/storageNodeAction';
import managementAction from '../redux/actions/managementAction';
import snapshotAction from '../redux/actions/snapshotAction';
import nasAction from '../redux/actions/nasAction';
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

    // login & logout
    async login ({username, password}){
        return await fetchPost('/api/login', {username, password});
    },

    async logout (username){
        return await fetchPost('/api/logout', {username});
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
            let data = await fetchGet('/api/getmetanodessummary');
            store.dispatch(metadataNodeAction.setMetadataNodeOverviewSummary(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getMetadataNodeOverviewUserOperationStatics (){
        try {
            let data = await fetchGet('/api/getmetanodesrequest');
            store.dispatch(metadataNodeAction.setMetadataNodeOverviewUserOperationStatics(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async getMetadataNodeDetailSummary ({node, nodeNumID} = (lsGet('currentMetadataNode') || {})){
        if (node){
            try {
                let data = await fetchGet('/api/getmetanodesummary', {node, nodeNumID});
                store.dispatch(metadataNodeAction.setMetadataNodeDetailSummary(data));
            } catch (e){
                errorHandler(e);
            }
        }
    },

    // storage node
    async getStorageNodeOverviewSummary (){
        try {
            let data = await fetchGet('/api/getstoragenodessummary');
            store.dispatch(storageNodeAction.setStorageNodeOverviewSummary(data));
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

    async getStorageNodeDetailSummary ({node, nodeNumID} = (lsGet('currentStorageNode') || {})){
        // if called by CronJob there will be no parameters, so get it from localStorage
        if (node){
            try {
                let data = await fetchGet('/api/getstoragenodesummary', {node, nodeNumID});
                store.dispatch(storageNodeAction.setStorageNodeDetailSummary(data));
            } catch (e){
                errorHandler(e);
            }
        }
    },

    async getStorageNodeDetailThroughput ({node, nodeNumID} = (lsGet('currentStorageNode') || {})){
        if (node){
            try {
                let data = await fetchGet('/api/getstoragenodethroughput', {node, nodeNumID});
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
            let data = await fetchGet('/api/getsnapshots');
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

    // NAS
    async getNasExportList (){
        try {
            let data = await fetchGet('/api/getnasexports');
            store.dispatch(nasAction.setNasExportList(data));
        } catch (e){
            errorHandler(e);
        }
    },

    async createNasExport (nasExport){
        await fetchPost('/api/createnasexport', nasExport);
    },

    async deleteNasExport (nasExport){
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