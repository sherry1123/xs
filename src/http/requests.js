import {fetchGet, fetchPost, fetchMock, lsGet} from '../services';
import store from '../redux';
import generalAction from '../redux/actions/generalAction';
import metadataNodeAction from '../redux/actions/metadataNodeAction';
import storageNodeAction from '../redux/actions/storageNodeAction';
import managementAction from '../redux/actions/managementAction';

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

    // initialize
    async checkIPs (IPs){
        try {
            await this.checkStoreIsReady();
            return await fetchMock(IPs);
        } catch (e){
            console.info(e.message);
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
            console.info(e.message);
        }
    },

    // metadata node
    async getMetadataNodeOverviewSummary (){
        try {
            let data = await fetchGet('/api/getmetanodessummary');
            store.dispatch(metadataNodeAction.setMetadataNodeOverviewSummary(data));
        } catch (e){
            console.info(e.message);
        }
    },

    async getMetadataNodeOverviewUserOperationStatics (){
        try {
            let data = await fetchGet('/api/getmetanodesrequest');
            store.dispatch(metadataNodeAction.setMetadataNodeOverviewUserOperationStatics(data));
        } catch (e){
            console.info(e.message);
        }
    },

    async getMetadataNodeDetailSummary ({node, nodeNumID} = (lsGet('currentMetadataNode') || {})){
        if (node){
            try {
                let data = await fetchGet('/api/getmetanodesummary', {node, nodeNumID});
                store.dispatch(metadataNodeAction.setMetadataNodeDetailSummary(data));
            } catch (e){
                console.info(e.message);
            }
        }
    },

    // storage node
    async getStorageNodeOverviewSummary (){
        try {
            let data = await fetchGet('/api/getstoragenodessummary');
            store.dispatch(storageNodeAction.setStorageNodeOverviewSummary(data));
        } catch (e){
            console.info(e.message);
        }
    },

    async getStorageNodeOverviewThroughput (){
        try {
            let data = await fetchGet('/api/getstoragenodesthroughput');
            store.dispatch(storageNodeAction.setStorageNodeOverviewThroughput(data));
        } catch (e){
            console.info(e.message);
        }
    },

    async getStorageNodeDetailSummary ({node, nodeNumID} = (lsGet('currentStorageNode') || {})){
        // if called by CronJob there will be no parameters, so get it from localStorage
        if (node){
            try {
                let data = await fetchGet('/api/getstoragenodesummary', {node, nodeNumID});
                store.dispatch(storageNodeAction.setStorageNodeDetailSummary(data));
            } catch (e){
                console.info(e.message);
            }
        }
    },

    async getStorageNodeDetailThroughput ({node, nodeNumID} = (lsGet('currentStorageNode') || {})){
        if (node){
            try {
                let data = await fetchGet('/api/getstoragenodethroughput', {node, nodeNumID});
                store.dispatch(storageNodeAction.setStorageNodeDetailThroughput(data));
            } catch (e){
                console.info(e.message);
            }
        }
    },

    // management
    async getEventLogs (){
        try {
            let data = await fetchGet('/api/geteventlog');
            store.dispatch(managementAction.setSystemEventLogs(data));
        } catch (e){
            console.info(e.message);
        }
    },

    async getAuditLogs (){
        try {
            let data = await fetchGet('/api/getauditlog');
            store.dispatch(managementAction.setSystemAuditLogs(data));
        } catch (e){
            console.info(e.message);
        }
    }

};