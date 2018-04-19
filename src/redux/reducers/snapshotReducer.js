import State from '../state';
import {snapshotActionTypes} from '../actions/snapshotAction';

const snapshotReducer = (state = State.main.snapshot, action) => {
    let {snapshotList, snapshotScheduleList, snapshotSetting} = action;
    switch (action.type){
        case snapshotActionTypes.SET_SNAPSHOT_LIST:
            return Object.assign({}, state, {snapshotList});

        case snapshotActionTypes.SET_SNAPSHOT_SCHEDULE_LIST:
            return Object.assign({}, state, {snapshotScheduleList});

        case snapshotActionTypes.SET_SNAPSHOT_SETTING:
            return Object.assign({}, state, {snapshotSetting});

        default:
            return state;
    }
};

export default snapshotReducer;