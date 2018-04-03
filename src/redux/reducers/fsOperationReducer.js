import State from '../state';
import {fsOperationActionTypes} from '../actions/fsOperationAction';

const fsOperationReducer = (state = State.main.fsOperation, action) => {
    let {entryInfo, files} = action;
    switch (action.type){
        case fsOperationActionTypes.SET_ENTRY_INFO:
            return Object.assign({}, state, {entryInfo});

        case fsOperationActionTypes.SET_FILES:
            return Object.assign({}, state, {files});

        default:
            return state;
    }
};

export default fsOperationReducer;