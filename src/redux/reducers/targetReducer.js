import State from '../state';
import {targetActionTypes} from '../actions/targetAction';

const targetReducer = (state = State.main.target, action) => {
    let {targetList, buddyGroupList, } = action;
    switch (action.type){
        case targetActionTypes.SET_TARGET_LIST:
            return Object.assign({}, state, {targetList});

        case targetActionTypes.SET_BUDDY_GROUP_LIST:
            return Object.assign({}, state, {buddyGroupList});

        default:
            return state;
    }
};

export default targetReducer;