import State from '../state';
import {managementActionTypes} from '../actions/managementAction';

const managementReducer = (state = State.main.management, action) => {
    switch (action.type){
        case managementActionTypes.SET_SYSTEM_EVENT_LOGS:
            return Object.assign({}, state, {eventLogs: action.eventLogs});

        case managementActionTypes.SET_SYSTEM_AUDIT_LOGS:
            return Object.assign({}, state, {auditLogs: action.auditLogs});

        default:
            return state;
    }
};

export default managementReducer;