import MockData from '../../mockData';
import {initializeActionTypes} from '../actions/initializeAction';

const initializeReducer = (state = MockData.initialize, action) => {
    let {category, index, ip} = action;
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

        default:
            return state;
    }
};

export default initializeReducer;