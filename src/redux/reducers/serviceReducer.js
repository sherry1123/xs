import State from '../state';
import {serviceActionTypes} from 'Actions/serviceAction';

const serviceReducer = (state = State.main.service, action) => {
    let {metadataServiceList, storageServiceList,} = action;
    switch (action.type){
        case serviceActionTypes.SET_METADATA_SERVICE_LIST:
            metadataServiceList.forEach(service => service.type = 'metadata');
            return Object.assign({}, state, {metadataServiceList});

        case serviceActionTypes.SET_STORAGE_SERVICE_LIST:
            storageServiceList.forEach(service => service.type = 'storage');
            return Object.assign({}, state, {storageServiceList});

        default:
            return state;
    }
};

export default serviceReducer;