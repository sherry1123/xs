export const storagePoolActionTypes = {
    SET_STORAGE_POOL_LIST: 'SET_STORAGE_POOL_LIST',
	SET_TARGET_OF_STORAGE_POOL: 'SET_TARGET_OF_STORAGE_POOL',
	SET_BUDDY_GROUP_OF_STORAGE_POOL: 'SET_BUDDY_GROUP_OF_STORAGE_POOL',
	SET_TARGETS_FOR_STORAGE_POOL: 'SET_TARGETS_FOR_STORAGE_POOL',
	SET_BUDDY_GROUPS_FOR_STORAGE_POOL: 'SET_BUDDY_GROUPS_FOR_STORAGE_POOL'
};

export default {
    setStoragePoolList: storagePoolList => ({
        type: storagePoolActionTypes.SET_STORAGE_POOL_LIST,
        storagePoolList
    }),

	setTargetsOfStoragePool: targetsOfStoragePool => ({
		type: storagePoolActionTypes.SET_TARGET_OF_STORAGE_POOL,
		targetsOfStoragePool
	}),

	setBuddyGroupsOfStoragePool: buddyGroupsOfStoragePool => ({
		type: storagePoolActionTypes.SET_BUDDY_GROUP_OF_STORAGE_POOL,
		buddyGroupsOfStoragePool
	}),

	setTargetsForStoragePool: targetsForStoragePool => ({
		type: storagePoolActionTypes.SET_TARGETS_FOR_STORAGE_POOL,
		targetsForStoragePool
	}),

	setBuddyGroupsForStoragePool: buddyGroupsForStoragePool => ({
		type: storagePoolActionTypes.SET_BUDDY_GROUPS_FOR_STORAGE_POOL,
		buddyGroupsForStoragePool
	}),
};