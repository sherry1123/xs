import MockData from '../../mockData';
import {initializeActionTypes} from '../actions/initializeAction';

const initializeReducer = (state = MockData['initialize'], action) => {
    switch (action.type){
        case initializeActionTypes.SET_METADATA_SERVER_IPS:
            return Object.assign({}, state, {metadataServerIPs: action.ips});
        case initializeActionTypes.SET_STORAGE_SERVER_IPS:
            return Object.assign({}, state, {storageServerIPs: action.ips});
        case initializeActionTypes.SET_CLIENT_IPS:
            return Object.assign({}, state, {clientIPs: action.ips});
        default:
            return state;
    }
};

export default initializeReducer;