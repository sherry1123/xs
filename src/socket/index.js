import io from 'socket.io-client';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsSet} from '../services';
import Cookie from 'js-cookie';

let isInitialized = Cookie.get('init');
if (isInitialized !== 'true'){
    let socket = io();
    socket.on('init status', initStatus => {
        // console.info('ws:', initStatus);
        lsSet('initStatus', initStatus);
        store.dispatch(initializeAction.setInitStatus(initStatus));
    });
}