export const storagePoolActionTypes = {
    SET_STORAGE_POOL_LIST: 'SET_STORAGE_POOL_LIST',
};

export default {
    setStoragePoolList: storagePoolList => ({
        type: storagePoolActionTypes.SET_STORAGE_POOL_LIST,
        storagePoolList
    }),
};