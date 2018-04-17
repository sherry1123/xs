import io from 'socket.io-client';
import {notification} from 'antd';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsSet, lsRemove, ckGet,} from '../services';
import {socketEventChannel, socketEventCode, eventCodeForEventChannel} from './conf';
import httpRequest from '../http/requests';
import lang from "../components/Language/lang";

let socket = io();
let isInitialized = ckGet('init');
if (isInitialized !== 'true'){
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
} else {
    // business operations after initialization and login
    socket.on('event status', ({channel, code, target, result}) => {
        console.info('event status: ', channel, code, target, result);
        let {language} = store.getState();
        notification[result ? 'success' : 'error']({
            message: socketEventChannel[channel]()[language] + lang('通知', 'Notification'),
            description: socketEventCode[code]()[language](target)
        });
        // request the appointed new data immediately by code
        if (eventCodeForEventChannel.snapshot.includes(code)){
            // snapshot
            httpRequest.getSnapshotList();
        }
    });
}