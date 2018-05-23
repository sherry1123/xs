import State from '../state';
import {dashboardActionTypes} from '../actions/dashboardAction';

const dashboardReducer = (state = State.main.dashboard, action) => {
    let {clusterInfo, clusterTargets, clusterThroughput, clusterIOPS, clusterPhysicalNodeList} = action;
    switch (action.type){
        case dashboardActionTypes.SET_CLUSTER_INFO:
            let {clusterStatus, clusterCapacity} = clusterInfo;
            return Object.assign({}, state, {clusterStatus, clusterCapacity});

        case dashboardActionTypes.SET_CLUSTER_TARGETS:
            return Object.assign({}, state, {clusterTargets});

        case dashboardActionTypes.SET_CLUSTER_THROUGHPUT:
            return Object.assign({}, state, {clusterThroughput});

        case dashboardActionTypes.SET_CLUSTER_IOPS:
            return Object.assign({}, state, {clusterIOPS});

        case dashboardActionTypes.SET_CLUSTER_PHYSICAL_NODE_LIST:
            return Object.assign({}, state, {clusterPhysicalNodeList});

        default:
            return state;
    }
};

export default dashboardReducer;