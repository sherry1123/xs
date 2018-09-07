import State from '../state';
import {localAuthUserActionTypes} from 'Actions/localAuthUserAction';

const shareReducer = (state = State.main.localAuthUser, action) => {
    let {localAuthUserList, localAuthUserGroupList, localAuthUserListOfGroup} = action;
    switch (action.type){
        case localAuthUserActionTypes.SET_LOCAL_AUTH_USER_LIST:
            return Object.assign({}, state, {localAuthUserList});

        case localAuthUserActionTypes.SET_LOCAL_AUTH_USER_GROUP_LIST:
            return Object.assign({}, state, {localAuthUserGroupList});

        case localAuthUserActionTypes.SET_LOCAL_AUTH_USER_LIST_OF_GROUP:
            return Object.assign({}, state, {localAuthUserListOfGroup});

        default:
            return state;
    }
};

export default shareReducer;