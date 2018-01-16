export const initializeActionTypes = {
    ADD_IP: 'ADD_IP',
    REMOVE_IP: 'REMOVE_IP',
    SET_IP: 'SET_IP',
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
};