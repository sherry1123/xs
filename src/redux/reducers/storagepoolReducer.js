import State from '../state';
import {storagePoolActionTypes} from 'Actions/storagePoolAction';

const snapshotReducer = (state = State.main.snapshot, action) => {
    let {storagePoolList,} = action;
    switch (action.type){
        case storagePoolActionTypes.SET_STORAGE_POOL_LIST:
            return Object.assign({}, state, {storagePoolList});

        default:
            return state;
    }
};

export default snapshotReducer;