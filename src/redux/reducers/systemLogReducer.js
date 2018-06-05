import State from '../state';
import {systemLogActionTypes} from '../actions/systemLogAction';

const managementReducer = (state = State.main.systemLog, action) => {
    switch (action.type){
        case systemLogActionTypes.SET_SYSTEM_EVENT_LOGS:
            return Object.assign({}, state, {eventLogs: action.eventLogs});

        case systemLogActionTypes.SET_SYSTEM_AUDIT_LOGS:
            return Object.assign({}, state, {auditLogs: action.auditLogs});

        default:
            return state;
    }
};

export default managementReducer;