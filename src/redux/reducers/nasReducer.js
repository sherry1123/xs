import State from '../state';
import {nasActionTypes} from '../actions/nasAction';

const nasReducer = (state = State.main.nas, action) => {
    let {nasExportList} = action;
    switch (action.type){
        case nasActionTypes.SET_NAS_EXPORT_LIST:
            return Object.assign({}, state, {nasExportList});

        default:
            return state;
    }
};

export default nasReducer;