import State from '../state';
import {storagePoolActionTypes} from 'Actions/storagePoolAction';

const storagePoolReducer = (state = State.main.storagePool, action) => {
    let {storagePoolList, targetsOfStoragePool, buddyGroupsOfStoragePool, targetsForStoragePool, buddyGroupsForStoragePool} = action;
    switch (action.type){
        case storagePoolActionTypes.SET_STORAGE_POOL_LIST:
            return Object.assign({}, state, {storagePoolList});

		case storagePoolActionTypes.SET_TARGET_OF_STORAGE_POOL:
			return Object.assign({}, state, {targetsOfStoragePool});

		case storagePoolActionTypes.SET_BUDDY_GROUP_OF_STORAGE_POOL:
			return Object.assign({}, state, {buddyGroupsOfStoragePool});

		case storagePoolActionTypes.SET_TARGETS_FOR_STORAGE_POOL:
			return Object.assign({}, state, {targetsForStoragePool});

		case storagePoolActionTypes.SET_BUDDY_GROUPS_FOR_STORAGE_POOL:
			return Object.assign({}, state, {buddyGroupsForStoragePool});

        default:
            return state;
    }
};

export default storagePoolReducer;