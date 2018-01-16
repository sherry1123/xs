export const initializeActionTypes = {
    ADD_METADATA_SERVER_IP: 'ADD_METADATA_SERVER_IP',
    ADD_STORAGE_SERVER_IP: 'ADD_STORAGE_SERVER_IP',
    ADD_CLIENT_IP: 'ADD_CLIENT_IP',

    REMOVE_METADATA_SERVER_IP: 'REMOVE_METADATA_SERVER_IP',
    REMOVE_STORAGE_SERVER_IP: 'REMOVE_METADATA_SERVER_IP',
    REMOVE_CLIENT_IP: 'REMOVE_CLIENT_IP',

    SET_METADATA_SERVER_IPS: 'CHANGE_METADATA_SERVER_IPS',
    SET_STORAGE_SERVER_IPS: 'CHANGE_STORAGE_SERVER_IPS',
    SET_CLIENT_IPS: 'CLIENT_IPS',


};

export default {
    addMetadataServerIP: () => ({
        type: initializeActionTypes.ADD_METADATA_SERVER_IP,
    }),
    addStorageServerIP: () => ({
        type: initializeActionTypes.ADD_STORAGE_SERVER_IP,
    }),
    addClientIP: () => ({
        type: initializeActionTypes.ADD_CLIENT_IP,
    }),

    removeMetadataServerIP: index => ({
        type: initializeActionTypes.REMOVE_METADATA_SERVER_IP,
        index
    }),
    removeStorageServerIP: index => ({
        type: initializeActionTypes.REMOVE_STORAGE_SERVER_IP,
        index
    }),
    removeClientIP: index => ({
        type: initializeActionTypes.REMOVE_CLIENT_IP,
        index
    }),

    setMetadataServerIPs: (ip, index) => ({
        type: initializeActionTypes.SET_METADATA_SERVER_IPS,
        ip,
        index
    }),
    setStorageServerIPs: (ip, index) => ({
        type: initializeActionTypes.SET_STORAGE_SERVER_IPS,
        ip,
        index
    }),
    setClientIPs: (ip, index) => ({
        type: initializeActionTypes.SET_CLIENT_IPS,
        ip,
        index
    })
};