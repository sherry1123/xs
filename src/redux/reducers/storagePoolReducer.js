import State from '../state';
import {storagePoolActionTypes} from 'Actions/storagePoolAction';

const storagePoolReducer = (state = State.main.storagePool, action) => {
    let {storagePoolList, dataClassificationList, targetsOfStoragePool, buddyGroupsOfStoragePool, targetsForStoragePool, buddyGroupsForStoragePool, userQuotasOfStoragePool, groupQuotasOfStoragePool} = action;
    switch (action.type){
        case storagePoolActionTypes.SET_STORAGE_POOL_LIST:
            return Object.assign({}, state, {storagePoolList});

		case storagePoolActionTypes.SET_DATA_CLASSIFICATION_LIST:
            return Object.assign({}, state, {dataClassificationList});

		case storagePoolActionTypes.SET_TARGET_OF_STORAGE_POOL:
			return Object.assign({}, state, {targetsOfStoragePool});

		case storagePoolActionTypes.SET_BUDDY_GROUP_OF_STORAGE_POOL:
			return Object.assign({}, state, {buddyGroupsOfStoragePool});

		case storagePoolActionTypes.SET_TARGETS_FOR_STORAGE_POOL:
			return Object.assign({}, state, {targetsForStoragePool});

		case storagePoolActionTypes.SET_BUDDY_GROUPS_FOR_STORAGE_POOL:
			return Object.assign({}, state, {buddyGroupsForStoragePool});

		case storagePoolActionTypes.SET_USER_QUOTAS_OF_STORAGE_POOL:
			return Object.assign({}, state, {userQuotasOfStoragePool});

		case storagePoolActionTypes.SET_GROUP_QUOTAS_OF_STORAGE_POOL:
			return Object.assign({}, state, {groupQuotasOfStoragePool});

        default:
            return state;
    }
};

export default storagePoolReducer;