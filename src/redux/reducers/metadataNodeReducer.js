import State from '../state';
import {metadataNodeActionTypes} from '../actions/metadataNodeAction';
import {storageNodeActionTypes} from "../actions/storageNodeAction";

const metadataNodeReducer = (state = State.main.storageNode, action) => {
    switch (action.type){
        case metadataNodeActionTypes.SET_METADATA_NODE_OVERVIEW_SUMMARY:
        {
            let {overview} = state;
            let {data: {status, general}} = action;
            overview = Object.assign({}, overview, {status, general});
            return Object.assign({}, state, {overview});
        }

        case metadataNodeActionTypes.SET_METADATA_NODE_OVERVIEW_USER_OPERATION_STATICS:
        {
            let {overview} = state;
            let {userOperationStatics} = action;
            overview = Object.assign({}, overview, {userOperationStatics});
            return Object.assign({}, state, {overview});
        }

        case storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_SUMMARY:
        {
            let {detail} = state;
            let {data: {general}} = action;
            detail = Object.assign({}, detail, {general});
            return Object.assign({}, state, {detail});
        }

        default:
            return state;
    }
};

export default metadataNodeReducer;