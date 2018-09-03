export const storagepoolActionTypes = {
	SET_STORAGEPOOL_LIST: 'SET_STORAGEPOOL_LIST',
};

export default {
	setStoragePoolList: storagepoolList => ({
		type: storagepoolActionTypes.SET_STORAGEPOOL_LIST,
		storagepoolList
	}),

};