import io from 'socket.io-client';
import {notification} from 'antd';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsGet, lsSet, lsRemove, lsClearAll, ckRemove} from '../services';
import {socketEventChannel, socketEventCode, eventCodeForEventChannel} from './conf';
import httpRequests from '../http/requests';
import lang from '../components/Language/lang';
import routerPath from '../views/routerPath';
let socket = io();

let {
    snapshot, snapshotRollBackStart, snapshotRollBackFinish,
    deInitializationStart, deInitializationEnd,
} = eventCodeForEventChannel;
let waitForServerUpTimeThreshold = 1000 * 60 * 5;
let requestServerUpInterval = 1000 * 2;

// initialization
socket.on('init status', initStatus => {
    console.info('ws init: ', initStatus);
    store.dispatch(initializeAction.setInitStatus(initStatus));
    if (!initStatus.status){
        if (!lsGet('initStep')){
            // exception case: open an another browser, with no initStep in localStorage
            lsSet('initStep', 3);
            window.location.href = routerPath.Root;
        }
        // normal case
        lsSet('initStatus', initStatus);
    } else {
        lsRemove(['initStep', 'initStatus']);
    }
});

// business operations after initialization and login
socket.on('event status', ({channel, code, target, result, notify}) => {
    console.info('ws event status: ', channel, code, target, result, notify);
    let {language} = store.getState();
    if (notify){
        notification[result ? 'success' : 'warning']({
            message: socketEventChannel[channel]()[language] + lang('通知', 'Notification'),
            description: socketEventCode[code]()[language](target, result)
        });
    }

    /*
     *   special codes handlers
     */

    // snapshot
    if (snapshot.includes(code)){
        // snapshot
        httpRequests.getSnapshotList();
    }
    // snapshot rolling back
    if (snapshotRollBackStart.includes(code)){
        // reload page and go through the system status logic in App.js
        window.location.href = routerPath.Root;
    }
    if (snapshotRollBackFinish.includes(code)){
        window.location.href = routerPath.Root;
        ckRemove('rollbacking');
    }

    // channel de-initialization
    if (deInitializationStart.includes(code)){
        window.location.href = routerPath.Root;
    }
    if (deInitializationEnd.includes(code)){
        // wait for server restart, and create a interval timer to request server status,
        // once server is up, do page jumping operation
        let timer = setInterval(async () => {
            try {
                await httpRequests.syncUpSystemStatus();
                clearInterval(timer);
                // clear all the records in localStorage
                lsClearAll();
                window.location.href = routerPath.Root;
            } catch (e){
                console.info(`Waiting for server restart, will try again ${requestServerUpInterval / 1000}s later ...`);
            }
        }, requestServerUpInterval);

        // clear the timer if the server hasn't been started until the time threshold is reached
        setTimeout(() => {
            clearInterval(timer);
            let {language} = store.getState();
            notification.error({
                description: language === 'chinese' ?
                    '未能连接到HTTP服务器，请联系运维人员介入处理！' :
                    'Connect to HTTP server failed, please contact operation and maintenance personnel to intervene!',
            });
        }, waitForServerUpTimeThreshold);
    }
});