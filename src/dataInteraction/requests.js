import store from '../redux';
import {fetchMock} from '../services';

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

    async checkIPs (IPs){
        try {
            await this.checkStoreIsReady();
            return await fetchMock(IPs);
        } catch (e){
            console.info(e);
        }
    },
};