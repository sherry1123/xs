export const shareActionTypes = {
    SET_NFS_LIST: 'SET_NFS_LIST',
    SET_CLIENT_LIST: 'SET_CLIENT_LIST',
    SET_CIFS_LIST: 'SET_CIFS_LIST',
};

export default {
    setNFSList: NFSList => ({
        type: shareActionTypes.SET_NFS_LIST,
        NFSList
    }),

    setCIFSList: CIFSList => ({
        type: shareActionTypes.SET_CIFS_LIST,
        CIFSList
    }),
};