import io from 'socket.io-client';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsSet} from '../services';

if (process.env.NODE_ENV !== 'development'){
    const socket = io();
    socket.on('init status', initStatus => {
        lsSet('initStatus', initStatus);
        store.dispatch(initializeAction.setInitStatus(initStatus));
    });
}