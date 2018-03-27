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
            let {data: {diskPerfRead, diskPerfWrite}} = action;
            let {overview} = state;
            let read = [], write = [], sum = [],time = [];
            (diskPerfRead || []).forEach((readItem, i) => {
                let readValue = readItem.value;
                let writeValue = diskPerfWrite[i].value;
                let sumValue = readValue + writeValue;
                read.push(readValue);
                write.push(writeValue);
                sum.push(sumValue);
                time.push(readItem.time);
            });
            let overviewThroughput = {read, write, sum, time};
            overview = Object.assign({}, overview, {overviewThroughput});
            return Object.assign({}, state, {overview});
        }

        // set storage nodes detail general
        case storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_SUMMARY:
        {
            let {detail} = state;
            let {data: {general, storageTargets}} = action;
            detail = Object.assign({}, detail, {general, storageTargets});
            return Object.assign({}, state, {detail});
        }

        // set storage nodes detail throughput
        case storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_THROUGHPUT:
        {
            let {data: {diskPerfRead, diskPerfWrite}} = action;
            let {detail} = state;
            let read = [], write = [], sum = [],time = [];
            (diskPerfRead || []).forEach((readItem, i) => {
                let readValue = readItem.value;
                let writeValue = diskPerfWrite[i].value;
                let sumValue = readValue + writeValue;
                read.push(readValue);
                write.push(writeValue);
                sum.push(sumValue);
                time.push(readItem.time);
            });
            let detailThroughput = {read, write, sum, time};
            detail = Object.assign({}, detail, {detailThroughput});
            return Object.assign({}, state, {detail});
        }

        default:
            return state;
    }
};

export default storageNodeReducer;