import State from '../state';
import {shareActionTypes} from '../actions/shareAction';

const shareReducer = (state = State.main.share, action) => {
    let {NFSList, clientListOfNFS, CIFSList, localAuthUserOrGroupListOfCIFS} = action;
    switch (action.type){
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