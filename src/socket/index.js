import io from 'socket.io-client';
import {notification} from 'antd';
import store from '../redux';
import initializeAction from '../redux/actions/initializeAction';
import {lsSet, lsRemove, ckGet, socketEventStatus} from '../services';
import lang from "../components/Language/lang";

let socket = io();
let isInitialized = ckGet('init');
if (isInitialized !== 'true'){
    // only for initialization
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
    // business operations
    socket.on('event status', ({channel, code, target, result}) => {
        console.info('event status: ', channel, code, target, result);
        let {language} = store.getState();
        notification[result ? 'success' : 'error']({
            message: lang('通知', 'Notification'),
            description: socketEventStatus[code]()[language](target)
        });
    });
}