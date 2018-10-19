import State from '../state';
import {dataCheckingActionTypes} from 'Actions/dataCheckingAction';

const dataCheckingReducer = (state = State.main.dataChecking, action) => {
    let {dataCheckingStatus, dataRecoveryStatus, dataCheckingAndRecoveryHistory} = action;
    switch (action.type){
        case dataCheckingActionTypes.SET_DATA_CHECKING_STATUS:
            return Object.assign({}, state, {dataCheckingStatus});

        case dataCheckingActionTypes.SET_DATA_RECOVERY_STATUS:
            return Object.assign({}, state, {dataRecoveryStatus});

        case dataCheckingActionTypes.SET_DATA_CHECKING_AND_RECOVERY_HISTORY:
            return Object.assign({}, state, {dataCheckingAndRecoveryHistory});

        default:
            return state;
    }
};

export default dataCheckingReducer;