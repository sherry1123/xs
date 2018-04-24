import io from 'socket.io-client';
import {notification} from 'antd';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsSet, lsRemove, ckRemove} from '../services';
import {socketEventChannel, socketEventCode, eventCodeForEventChannel} from './conf';
import httpRequests from '../http/requests';
import lang from '../components/Language/lang';
import routerPath from '../views/routerPath';

let socket = io();
let {snapshot, snapshotRollBackStart, snapshotRollBackFinish, deInitializationStart, deInitializationEnd} = eventCodeForEventChannel;
let waitForServerUpTimeThreshold = 1000 * 60 * 5;
let requestServerUpInterval = 1000 * 2;

// initialization
socket.on('init status', initStatus => {
    console.info('ws init: ', initStatus);
    store.dispatch(initializeAction.setInitStatus(initStatus));
    if (!initStatus.status){
        lsSet('initStatus', initStatus);
    } else {
        lsRemove(['initStep', 'initStatus']);
    }
});

// business operations after initialization and login
socket.on('event status', ({channel, code, target, result}) => {
    console.info('ws event status: ', channel, code, target, result);
    let {language} = store.getState();
    console.info(language);
    notification[result ? 'success' : 'error']({
        message: socketEventChannel[channel]()[language] + lang('通知', 'Notification'),
        description: socketEventCode[code]()[language](target, result)
    });

    // special codes handlers
    if (snapshot.includes(code)){
        // snapshot
        httpRequests.getSnapshotList();
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

    // de-initialization
    if (deInitializationStart === code){
        window.location.href = '/#' + routerPath.DeInitializing;
    }
    if (deInitializationEnd === code){
        // wait for server restart, and create a interval timer to request server status,
        // once server is up, do page jumping operation
        let timer = setInterval(async () => {
            try {
                 await httpRequests.syncUpSystemStatus();
                 clearInterval(timer);
                 window.location.href = '/#' + routerPath.Init;
            } catch (e){
                console.info(`Connect to server failed, will try again ${requestServerUpInterval / 1000} seconds later ...`);
            }
        }, requestServerUpInterval);

        // clear the timer if the server hasn't been started until the time threshold is reached
        setTimeout(() => {
            clearInterval(timer);
            let {language} = store.getState();
            notification.error({
                description: language === 'chinese' ?
                    'HTTP服务器启动失败，请联系运维人员介入处理！' :
                    'HTTP server startup failure, please contact operation and maintenance personnel to intervene!',
            });
        }, waitForServerUpTimeThreshold);
    }
});