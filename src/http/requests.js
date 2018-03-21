import {fetchGet, fetchPost, fetchMock, lsGet} from '../services';
import store from '../redux';
import storageNodeAction from '../redux/actions/storageNodeAction';

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
            console.info(e);
        }
    },

    // login & logout
    async login (){
        try {
            return await fetchPost('/api/login', {username: 'admin', password: '123456'});
        } catch (e){
            console.info(e);
        }
    },

    async logout (){
        try {
            return await fetchPost('/api/logout', {username: 'admin'});
        } catch (e){
            console.info(e);
        }
    },

    // main
    // storage node
    async getStorageNodeOverviewSummary (){
        try {
            let data = await fetchGet('/api/getstoragenodessummary');
            store.dispatch(storageNodeAction.setStorageNodeOverviewSummary(data));
        } catch (e){
            console.info(e);
        }
    },

    async getStorageNodeOverviewThroughput (){
        try {
            let data = await fetchGet('/api/getstoragenodesthroughput');
            store.dispatch(storageNodeAction.setStorageNodeOverviewThroughput(data));
        } catch (e){
            console.info(e);
        }
    },

    async getStorageNodeDetailSummary ({node, nodeNumID} = lsGet('storageCurrentNode')){
        // if called by CronJob there will be no parameters, so get it from localStorage
        if (node){
            try {
                let data = await fetchGet('/api/getstoragenodesummary', {node, nodeNumID});
                store.dispatch(storageNodeAction.setStorageNodeDetailSummary(data));
            } catch (e){
                console.info(e);
            }
        }
    },

    async getStorageNodeDetailThroughput ({node, nodeNumID} = lsGet('storageCurrentNode')){
        if (node){
            try {
                let data = await fetchGet('/api/getstoragenodethroughput', {node, nodeNumID});
                store.dispatch(storageNodeAction.setStorageNodeDetailThroughput(data));
            } catch (e){
                console.info(e);
            }
        }
    }
};