export const shareActionTypes = {
    SET_CLIENT_LIST_FOR_NAS_SERVER: 'SET_CLIENT_LIST_FOR_NAS_SERVER',
    SET_NAS_SERVER_LIST: 'SET_NAS_SERVER_LIST',
    SET_NFS_LIST: 'SET_NFS_LIST',
    SET_CLIENT_LIST_OF_NFS: 'SET_CLIENT_LIST_OF_NFS',
    SET_CIFS_LIST: 'SET_CIFS_LIST',
    SET_LOCAL_AUTH_USER_OR_GROUP_LIST_OF_CIFS: 'SET_LOCAL_AUTH_USER_OR_GROUP_LIST_OF_CIFS',
};

export default {
    setClientListForNASServer: clientListForNASServer => ({
        type: shareActionTypes.SET_CLIENT_LIST_FOR_NAS_SERVER,
        clientListForNASServer
    }),

    setNASServerList: NASServerList => ({
        type: shareActionTypes.SET_NAS_SERVER_LIST,
        NASServerList
    }),

    setNFSList: NFSList => ({
        type: shareActionTypes.SET_NFS_LIST,
        NFSList
    }),

    setClientListOfNFS: clientListOfNFS => ({
        type: shareActionTypes.SET_CLIENT_LIST_OF_NFS,
        clientListOfNFS
    }),

    setCIFSList: CIFSList => ({
        type: shareActionTypes.SET_CIFS_LIST,
        CIFSList
    }),

    setLocalAuthUserOrGroupListOfCIFS: localAuthUserOrGroupListOfCIFS => ({
        type: shareActionTypes.SET_LOCAL_AUTH_USER_OR_GROUP_LIST_OF_CIFS,
        localAuthUserOrGroupListOfCIFS
    }),

};