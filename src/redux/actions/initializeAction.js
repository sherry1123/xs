export const initializeActionTypes = {
    SET_METADATA_SERVER_IPS: 'CHANGE_METADATA_SERVER_IPS',
    SET_STORAGE_SERVER_IPS: 'CHANGE_STORAGE_SERVER_IPS',
    SET_CLIENT_IPS: 'CLIENT_IPS'
};

export default {
    setMetadataServerIPs: ips => ({
        type: initializeActionTypes.SET_METADATA_SERVER_IPS,
        ips
    }),
    setStorageServerIPs: ips => ({
        type: initializeActionTypes.SET_STORAGE_SERVER_IPS,
        ips
    }),
    setClientIPs: ips => ({
        type: initializeActionTypes.SET_CLIENT_IPS,
        ips
    })
};