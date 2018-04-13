import State from '../state';
import {snapshotActionTypes} from '../actions/snapshotAction';

const snapshotReducer = (state = State.main.snapshot, action) => {
    let {snapshotList, snapshotScheduleList} = action;
    switch (action.type){
        case snapshotActionTypes.SET_SNAPSHOT_LIST:
            return Object.assign({}, state, {snapshotList});

        case snapshotActionTypes.SET_SNAPSHOT_SCHEDULE_LIST:
            return Object.assign({}, state, {snapshotScheduleList});

        default:
            return state;
    }
};

export default snapshotReducer;