export const serviceActionTypes = {
    SET_METADATA_SERVICE_LIST: 'SET_METADATA_SERVICE_LIST',
    SET_STORAGE_SERVICE_LIST: 'SET_STORAGE_SERVICE_LIST',
};

export default {
    setMetadataServiceLiSt: metadataServiceList => ({
        type: serviceActionTypes.SET_METADATA_SERVICE_LIST,
        metadataServiceList
    }),

    setStorageServiceLiSt: storageServiceList => ({
        type: serviceActionTypes.SET_STORAGE_SERVICE_LIST,
        storageServiceList
    }),
};