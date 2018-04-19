import io from 'socket.io-client';
import {notification} from 'antd';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsSet, lsRemove, ckRemove} from '../services';
import {socketEventChannel, socketEventCode, eventCodeForEventChannel} from './conf';
import httpRequest from '../http/requests';
import lang from '../components/Language/lang';
import routerPath from '../views/routerPath';

let socket = io();

// initialization
socket.on('init status', initStatus => {
    console.info('init ws: ', initStatus);
    store.dispatch(initializeAction.setInitStatus(initStatus));
    if (!initStatus.status){
        lsSet('initStatus', initStatus);
    } else {
        lsRemove(['initStep', 'initStatus']);
    }
});

// business operations after initialization and login
socket.on('event status', ({channel, code, target, result}) => {
    console.info('event status: ', channel, code, target, result);
    let {language} = store.getState();
    console.info(language);
    notification[result ? 'success' : 'error']({
        message: socketEventChannel[channel]()[language] + lang('通知', 'Notification'),
        description: socketEventCode[code]()[language](target, result)
    });

    // post handlers
    // request the appointed new data immediately by code
    let {snapshot, snapshotRollBackStart, snapshotRollBackFinish} = eventCodeForEventChannel;
    if (snapshot.includes(code)){
        // snapshot
        httpRequest.getSnapshotList();
    }
    // snapshot rolling back
    if (snapshotRollBackStart === code){
        // reload page and go through the system status logic in App.js
        window.location.href = routerPath.Root;
    }
    if (snapshotRollBackFinish === code){
        window.location.href = routerPath.Root;
        ckRemove('rollbacking');
    }
});