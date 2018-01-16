import MockData from '../../mockData';
import {initializeActionTypes} from '../actions/initializeAction';

const initializeReducer = (state = MockData['initialize'], action) => {
    let {metadataServerIPs, storageServerIPs, clientIPs} = state;

    switch (action.type){
        // add
        case initializeActionTypes.ADD_METADATA_SERVER_IP:
            metadataServerIPs.push('');
            return Object.assign({}, state, {metadataServerIPs});
        case initializeActionTypes.ADD_STORAGE_SERVER_IP:
            storageServerIPs.push('');
            return Object.assign({}, state, {storageServerIPs});
        case initializeActionTypes.ADD_CLIENT_IP:
            clientIPs.push('');
            return Object.assign({}, state, {clientIPs});

        // remove
        case initializeActionTypes.REMOVE_METADATA_SERVER_IP:
            metadataServerIPs.splice(metadataServerIPs.findIndex(action.index), 1);
            return Object.assign({}, state, {metadataServerIPs});
        case initializeActionTypes.REMOVE_STORAGE_SERVER_IP:
            storageServerIPs.splice(storageServerIPs.findIndex(action.index), 1);
            return Object.assign({}, state, {storageServerIPs});
        case initializeActionTypes.REMOVE_CLIENT_IP:
            clientIPs.splice(clientIPs.findIndex(action.index), 1);
            return Object.assign({}, state, {clientIPs});

        // set
        case initializeActionTypes.SET_METADATA_SERVER_IPS:
            metadataServerIPs[action.index] = action.ip;
            return Object.assign({}, state, {metadataServerIPs});
        case initializeActionTypes.SET_STORAGE_SERVER_IPS:
            storageServerIPs[action.index] = action.ip;
            return Object.assign({}, state, {storageServerIPs});
        case initializeActionTypes.SET_CLIENT_IPS:
            clientIPs[action.index] = action.ip;
            return Object.assign({}, state, {clientIPs});

        default:
            return state;
    }
};

export default initializeReducer;