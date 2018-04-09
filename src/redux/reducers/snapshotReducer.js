import State from '../state';
import {snapshotActionTypes} from '../actions/snapshotAction';

const snapshotReducer = (state = State.main.snapshot, action) => {
    let {snapshotList} = action;
    switch (action.type){
        case snapshotActionTypes.SET_SNAPSHOT_LIST:
            return Object.assign({}, state, {snapshotList});

        default:
            return state;
    }
};

export default snapshotReducer;