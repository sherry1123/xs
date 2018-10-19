export const dataCheckingActionTypes = {
    SET_DATA_CHECKING_STATUS: 'SET_DATA_CHECKING_STATUS',
    SET_DATA_RECOVERY_STATUS: 'SET_DATA_RECOVERY_STATUS',
    SET_DATA_CHECKING_AND_RECOVERY_HISTORY: 'SET_DATA_CHECKING_AND_RECOVERY_HISTORY',
};

export default {
    setDataCheckingStatus: dataCheckingStatus => ({
        type: dataCheckingActionTypes.SET_DATA_CHECKING_STATUS,
        dataCheckingStatus
    }),

    setDataRecoveryStatus: dataRecoveryStatus => ({
        type: dataCheckingActionTypes.SET_DATA_RECOVERY_STATUS,
        dataRecoveryStatus
    }),

    setDataCheckingAndRecoveryHistory: dataCheckingAndRecoveryHistory => ({
        type: dataCheckingActionTypes.SET_DATA_CHECKING_AND_RECOVERY_HISTORY,
        dataCheckingAndRecoveryHistory
    }),
};