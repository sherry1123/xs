import State from '../state';
import {storageNodeActionTypes} from '../actions/storageNodeAction';

const storageNodeReducer = (state = State.main.storageNode, action) => {
    switch (action.type){
        // set storage nodes list
        case storageNodeActionTypes.SET_STORAGE_NODES:
        {
            let {overview} = state;
            let {data: nodeList} = action;
            overview = Object.assign({}, overview, {nodeList});
            return Object.assign({}, state, {overview});
        }

        // set storage nodes disk space
        case storageNodeActionTypes.SET_STORAGE_NODE_DISK_STATUS:
        {
            let {overview} = state;
            let {data: diskSpace} = action;
            overview = Object.assign({}, overview, {diskSpace});
            return Object.assign({}, state, {overview});
        }

        // set storage nodes overview throughput
        case storageNodeActionTypes.SET_STORAGE_NODE_OVERVIEW_THROUGHPUT:
        {
            let {data: {read, write, total, time}} = action;
            let {overview} = state;
            let overviewThroughput = {read, write, total, time};
            overview = Object.assign({}, overview, {overviewThroughput});
            return Object.assign({}, state, {overview});
        }

        // set storage nodes detail general
        case storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_TARGETS:
        {
            let {detail} = state;
            let {data: storageTargets} = action;
            detail = Object.assign({}, detail, {storageTargets});
            return Object.assign({}, state, {detail});
        }

        // set storage nodes detail throughput
        case storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_THROUGHPUT:
        {
            let {data: {read, write, total, time}} = action;
            let {detail} = state;
            let detailThroughput = {read, write, total, time};
            detail = Object.assign({}, detail, {detailThroughput});
            return Object.assign({}, state, {detail});
        }

        default:
            return state;
    }
};

export default storageNodeReducer;