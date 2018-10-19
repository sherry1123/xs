import State from '../state';
import {systemConfigurationActionTypes} from 'Actions/systemConfigurationAction';

const systemConfigurationReducer = (state = State.main.SystemConfiguration, action) => {
    let {systemParameterList } = action;
    switch (action.type){
        case systemConfigurationActionTypes.SET_SYSTEM_PARAMETER_LIST:
            return Object.assign({}, state, {systemParameterList});

        default:
            return state;
    }
};

export default systemConfigurationReducer;