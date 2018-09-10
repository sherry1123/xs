import State from '../state';
import {shareActionTypes} from 'Actions/shareAction';

const shareReducer = (state = State.main.share, action) => {
    let {clientListForNASServer, NASServerList, NFSList, clientListOfNFS, CIFSList, localAuthUserOrGroupListOfCIFS} = action;
    switch (action.type){
        case shareActionTypes.SET_CLIENT_LIST_FOR_NAS_SERVER:
            return Object.assign({}, state, {clientListForNASServer});

        case shareActionTypes.SET_NAS_SERVER_LIST:
            return Object.assign({}, state, {NASServerList});

        case shareActionTypes.SET_NFS_LIST:
            return Object.assign({}, state, {NFSList});

        case shareActionTypes.SET_CLIENT_LIST_OF_NFS:
            return Object.assign({}, state, {clientListOfNFS});

        case shareActionTypes.SET_CIFS_LIST:
            return Object.assign({}, state, {CIFSList});

        case shareActionTypes.SET_LOCAL_AUTH_USER_OR_GROUP_LIST_OF_CIFS:
            return Object.assign({}, state, {localAuthUserOrGroupListOfCIFS});

        default:
            return state;
    }
};

export default shareReducer;