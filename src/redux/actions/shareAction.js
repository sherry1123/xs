export const shareActionTypes = {
    SET_SHARE_LIST: 'SET_SHARE_LIST',
};

export default {
    setShareList: shareList => ({
        type: shareActionTypes.SET_SHARE_LIST,
        shareList
    }),
};