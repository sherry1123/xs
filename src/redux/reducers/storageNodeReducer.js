import State from '../state';
import {storageNodeActionTypes} from '../actions/storageNodeAction';

const storageNodeReducer = (state = State.main.storageNode, action) => {
    switch (action.type){
        // set storage nodes overview summary: node status and disk space
        case storageNodeActionTypes.SET_STORAGE_NODE_OVERVIEW_SUMMARY:
        {
            let {overview} = state;
            let {data: {status, diskSpace}} = action;
            overview = Object.assign({}, overview, {status, diskSpace});
            return Object.assign({}, state, {overview});
        }

        // set storage nodes overview throughput
        case storageNodeActionTypes.SET_STORAGE_NODE_OVERVIEW_THROUGHPUT:
        {
            let {data: {diskReadSum, diskWriteSum}} = action;
            let {overview} = state;
            let throughput = Object.assign([], overview.throughput);
            let totalSum = diskReadSum + diskWriteSum;
            throughput.push({diskReadSum, diskWriteSum, totalSum, time: Date.now()});
            if (throughput.length > 60){
                throughput.shift();
            }
            overview = Object.assign({}, overview, {throughput});
            console.info(throughput);
            return Object.assign({}, state, {overview});
        }

        default:
            return state;
    }
};

export default storageNodeReducer;