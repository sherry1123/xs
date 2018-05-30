import State from '../state';
import {initializeActionTypes} from '../actions/initializeAction';

const initializeReducer = (state = State.initialize, action) => {
    let {category, index, ip, enableHA, enableRAID, RAIDConfig, initStatus, defaultUser,} = action;
    let rawIPs = state[category] || [];
    let IPs = Object.assign([], rawIPs);
    let newIPs = {};
    switch (action.type){
        // add
        case initializeActionTypes.ADD_IP:
            IPs.push('');
            newIPs[category] = IPs;
            return Object.assign({}, state, newIPs);

        // remove
        case initializeActionTypes.REMOVE_IP:
            IPs.splice(index, 1);
            newIPs[category] = IPs;
            return Object.assign({}, state, newIPs);

        // set
        case initializeActionTypes.SET_IP:
            IPs[index] = ip;
            newIPs[category] = IPs;
            return Object.assign({}, state, newIPs);

        // enable HA
        case initializeActionTypes.SET_ENABLE_HA:
            return Object.assign({}, state, {enableHA});

        // enable RAID
        case initializeActionTypes.SET_ENABLE_RAID:
            return Object.assign({}, state, {enableRAID});

        // RAID config
        case initializeActionTypes.SET_RAID_CONFIG:
            return Object.assign({}, state, {RAIDConfig});

        // initialization status
        case initializeActionTypes.SET_INIT_STATUS:
            return Object.assign({}, state, {initStatus});

        // default user
        case initializeActionTypes.SET_DEFAULT_USER:
            return Object.assign({}, state, {defaultUser});

        default:
            return state;
    }
};

export default initializeReducer;