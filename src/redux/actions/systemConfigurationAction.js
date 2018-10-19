export const systemConfigurationActionTypes = {
    SET_SYSTEM_PARAMETER_LIST: 'SET_SYSTEM_PARAMETER_LIST',

};

export default {
    setSystemParameterList: systemParameterList => ({
        type: systemConfigurationActionTypes.SET_SYSTEM_PARAMETER_LIST,
        systemParameterList
    }),

};