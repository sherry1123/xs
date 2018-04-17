import State from '../state';
import {shareActionTypes} from '../actions/shareAction';

const shareReducer = (state = State.main.share, action) => {
    let {shareList} = action;
    switch (action.type){
        case shareActionTypes.SET_SHARE_LIST:
            return Object.assign({}, state, {shareList});

        default:
            return state;
    }
};

export default shareReducer;