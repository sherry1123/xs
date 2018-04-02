export const initializeActionTypes = {
    ADD_IP: 'ADD_IP',
    REMOVE_IP: 'REMOVE_IP',
    SET_IP: 'SET_IP',
    SET_ENABLE_HA: 'SET_ENABLE_HA',
    SET_ENABLE_RAID: 'SET_ENABLE_RAID',
    SET_INIT_STATUS: 'SET_INIT_STATUS',
    SET_DEFAULT_USER: 'SET_DEFAULT_USER',
};

export default {
    addIP: category => ({
        type: initializeActionTypes.ADD_IP,
        category
    }),

    removeIP: (category, index) => ({
        type: initializeActionTypes.REMOVE_IP,
        category,
        index
    }),

    setIP: (category, index, ip) => ({
        type: initializeActionTypes.SET_IP,
        category,
        index,
        ip
    }),

    setEnableHA: enableHA => ({
        type: initializeActionTypes.SET_ENABLE_HA,
        enableHA
    }),

    setEnableRAID: enableRAID => ({
        type: initializeActionTypes.SET_ENABLE_RAID,
        enableRAID
    }),

    setInitStatus: initStatus => ({
        type: initializeActionTypes.SET_INIT_STATUS,
        initStatus
    }),

    setDefaultUser: defaultUser => ({
        type: initializeActionTypes.SET_DEFAULT_USER,
        defaultUser
    }),
};