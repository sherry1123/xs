import State from '../state';
import {metadataNodeActionTypes} from '../actions/metadataNodeAction';

const metadataNodeReducer = (state = State.main.storageNode, action) => {
    switch (action.type){
        case metadataNodeActionTypes.SET_METADATA_NODE_OVERVIEW_SUMMARY:
        {
            let {overview} = state;
            let {data} = action;
            overview = Object.assign({}, overview, {nodeList: data});
            return Object.assign({}, state, {overview});
        }

        case metadataNodeActionTypes.SET_METADATA_NODE_OVERVIEW_STATICS:
        {
            let {overview} = state;
            let {statics} = action;
            overview = Object.assign({}, overview, {statics});
            return Object.assign({}, state, {overview});
        }

        case metadataNodeActionTypes.SET_METADATA_NODE_DETAIL_SUMMARY:
        {
            let {detail} = state;
            let {data: {general}} = action;
            detail = Object.assign({}, detail, {general});
            return Object.assign({}, state, {detail});
        }

        case metadataNodeActionTypes.SET_METADATA_NODE_DETAIL_STATICS:
        {
            let {detail} = state;
            let {statics} = action;
            detail = Object.assign({}, detail, {statics});
            return Object.assign({}, state, {detail});
        }

        default:
            return state;
    }
};

export default metadataNodeReducer;