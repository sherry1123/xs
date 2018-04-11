import io from 'socket.io-client';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsSet, lsRemove, ckGet} from '../services';

let isInitialized = ckGet('init');
if (isInitialized !== 'true'){
    let socket = io();
    socket.on('init status', initStatus => {
        console.info('init ws:', initStatus);
        store.dispatch(initializeAction.setInitStatus(initStatus));
        if (!initStatus.status){
            lsSet('initStatus', initStatus);
        } else {
            lsRemove(['initStep', 'initStatus']);
        }
    });
}