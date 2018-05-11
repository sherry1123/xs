import State from '../state';
import {shareActionTypes} from '../actions/shareAction';

const shareReducer = (state = State.main.share, action) => {
    let {NFSList, CIFSList} = action;
    switch (action.type){
        case shareActionTypes.SET_NFS_LIST:
            return Object.assign({}, state, {NFSList});

        case shareActionTypes.SET_CIFS_LIST:
            return Object.assign({}, state, {CIFSList});

        default:
            return state;
    }
};

export default shareReducer;