import State from '../state';
import {dataNodeActionTypes} from '../actions/dataNodeAction';

const dataNodeReducer = (state = State.main.dataNode, action) => {
    let {currentPhysicalNode, physicalNodeInfo, physicalNodeTargets, physicalNodeCPU, physicalNodeRAM, physicalNodeTPS, physicalNodeIOPS} = action;
    switch (action.type){
        case dataNodeActionTypes.SET_CURRENT_PHYSICAL_NODE:
            return Object.assign({}, state, {currentPhysicalNode});

        case dataNodeActionTypes.SET_PHYSICAL_NODE_INFO:
            return Object.assign({}, state, {physicalNodeInfo});

        case dataNodeActionTypes.SET_PHYSICAL_NODE_TARGETS:
            return Object.assign({}, state, {physicalNodeTargets});

        case dataNodeActionTypes.SET_PHYSICAL_NODE_CPU:
            return Object.assign({}, state, {physicalNodeCPU});

        case dataNodeActionTypes.SET_PHYSICAL_NODE_RAM:
            return Object.assign({}, state, {physicalNodeRAM});

        case dataNodeActionTypes.SET_PHYSICAL_NODE_TPS:
            return Object.assign({}, state, {physicalNodeTPS});

        case dataNodeActionTypes.SET_PHYSICAL_NODE_IOPS:
            return Object.assign({}, state, {physicalNodeIOPS});

        default:
            return state;
    }
};

export default dataNodeReducer;