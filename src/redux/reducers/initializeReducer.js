import State from '../state';
import {initializeActionTypes} from '../actions/initializeAction';

const initializeReducer = (state = State.initialize, action) => {
    let {category, index, ip, enableHA, enableRAID, recommendedRAID, enableCustomRAID, customRAID, enableCreateBuddyGroup, initStatus, defaultUser,} = action;
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

        // recommended RAID
        case initializeActionTypes.SET_RECOMMENDED_RAID:
            return Object.assign({}, state, {recommendedRAID});

        // enable custom RAID
        case initializeActionTypes.SET_ENABLE_CUSTOM_RAID:
            return Object.assign({}, state, {enableCustomRAID});

        // custom RAID
        case initializeActionTypes.SET_CUSTOM_RAID:
            return Object.assign({}, state, {customRAID});

        // create buddy group
        case initializeActionTypes.SET_ENABLE_CREATE_BUDDY_GROUP:
            return Object.assign({}, state, {enableCreateBuddyGroup});

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