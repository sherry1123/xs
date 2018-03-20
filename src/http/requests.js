import {fetchGet, fetchMock} from '../services';
import store from '../redux';
import storageNodeAction from '../redux/actions/storageNodeAction';

export default  {
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
            let data = await fetchGet('/api/getstoragenodesthroughout');
            store.dispatch(storageNodeAction.setStorageNodeOverviewThroughput(data));
        } catch (e){
            console.info(e);
        }
    },

    async getStorageNodeDetailSummary (node, nodeNumID){
        try {
            await fetchGet('/api/getstoragenodesummary', {node, nodeNumID});
        } catch (e){
            console.info(e);
        }
    },

    async getStorageNodeDetailThroughput (node, nodeNumID){
        try {
            await fetchGet('/api/getstoragenodethroughout', {node, nodeNumID});
        } catch (e){
            console.info(e);
        }
    }
};