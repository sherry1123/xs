import State from '../state';
import {dashboardActionTypes} from 'Actions/dashboardAction';

const dashboardReducer = (state = State.main.dashboard, action) => {
    let {clusterInfo, clusterTargets, clusterTPS, clusterIOPS, clusterPhysicalNodeList, clusterServiceAndClientIPs, customRAIDList} = action;
    switch (action.type){
        case dashboardActionTypes.SET_CLUSTER_INFO:
            let {clusterStatus, clusterCapacity} = clusterInfo;
            return Object.assign({}, state, {clusterStatus, clusterCapacity});

        case dashboardActionTypes.SET_CLUSTER_TARGETS:
            return Object.assign({}, state, {clusterTargets});

        case dashboardActionTypes.SET_CLUSTER_TPS:
            return Object.assign({}, state, {clusterTPS});

        case dashboardActionTypes.SET_CLUSTER_IOPS:
            return Object.assign({}, state, {clusterIOPS});

        case dashboardActionTypes.SET_CLUSTER_PHYSICAL_NODE_LIST:
            return Object.assign({}, state, {clusterPhysicalNodeList});

        case dashboardActionTypes.SET_CLUSTER_SERVICE_AND_CLIENT_IPS:
            return Object.assign({}, state, {clusterServiceAndClientIPs});

        case dashboardActionTypes.SET_CUSTOM_RAID_LIST:
            return Object.assign({}, state, {customRAIDList});

        default:
            return state;
    }
};

export default dashboardReducer;