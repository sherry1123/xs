import io from 'socket.io-client';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {notification} from 'antd';
import {lsGet, lsSet, lsRemove, lsClearAll, ckRemove} from '../services';
import {socketEventChannel, socketEventCode, eventCodeForEventChannel} from './conf';
import httpRequests from '../http/requests';
import lang from '../components/Language/lang';
import routerPath from '../views/routerPath';

// Consider to the http load balancing policy provided by node.js cluster module on server side,
// we don't wanna socket.io client to do handshake here, just let it establish a single and pure ws
// connection with server, and don't use protocol upgrade. Because the load balancing http requests
// in handshake steps will be dispatch to different http server process to handle without a unified
// session management. When socket.io using the token received from the first http server to try to
// establish connection with another server assigned by load balancing policy will be failed absolutely.
// Further:
// Out of consideration for communication security, we can do handshake by ourselves by some special ways.
// const socket = io({transports: ['websocket']});

const socket = io();

// some pre-configs
const {snapshot, snapshotRollBackStart, snapshotRollBackFinish, deInitializationStart, deInitializationEnd, reInitializationStart, reInitializationEnd} = eventCodeForEventChannel;
const waitForServerUpTimeThreshold = 1000 * 60 * 5;
const requestServerUpInterval = 1000 * 2;

// initialization message
socket.on('init status', initStatus => {
    if (process.env.NODE_ENV === 'development'){
        console.info('%c ws message(init status): ', 'color: #f6b93f', 'init status:', initStatus);
    }
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

// business operations message after initialization and login
socket.on('event status', ({channel, code, target, result, notify}) => {
    if (process.env.NODE_ENV === 'development'){
        console.info('%c ws message(event status): ', 'color: #00cc00', 'channel:', channel, ', code:', code, ', target:',target, ', result:', result, ', notify:', notify);
    }
    let {language} = store.getState();
    if (notify){
        notification[result ? 'success' : 'warning']({
            message: socketEventChannel[channel]()[language] + lang('通知', 'Notification'),
            description: socketEventCode[code]()[language](target, result)
        });
    }

    /*
     * Special Codes Handlers
     * Sometimes we receive a websocket message from server, and notification isn't the only thing
     * we need to do. There are some other important logic we should execute depend on the message code.
     */

    /*** snapshot channel ***/

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
        ckRemove('rollbacking');
        setTimeout(() => window.location.href = '/#' + routerPath.Main + routerPath.Snapshot, 2000);
    }

    /*** system channel ***/

    // cluster de-initialization, re-initialization
    if (deInitializationStart.includes(code) || reInitializationStart.includes(code)){
        window.location.href = routerPath.Root;
    }
    if (deInitializationEnd.includes(code) || reInitializationEnd.includes(code)){
        // wait for server restart, and create a interval timer to request server status,
        // once server is up, do page jumping operation
        let timer = setInterval(async () => {
            try {
                await httpRequests.syncUpSystemStatus();
                clearInterval(timer);
                let floatIP = lsGet('floatIP');
                // clear all the records in localStorage
                lsClearAll();
                if (!!floatIP){
                    window.location.href = 'http://' + floatIP;
                } else {
                    window.location.href = routerPath.Root;
                }
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
                    'Connect to HTTP server failed, please ask operation and maintenance personnel for help!',
            });
        }, waitForServerUpTimeThreshold);
    }
});