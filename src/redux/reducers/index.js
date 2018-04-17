import {combineReducers} from 'redux';
import State from '../state';
import {lsGet} from '../../services';
import languageReducer from './languageReducer';
import initializeReducer from './initializeReducer';
import generalReducer from './generalReducer';
import metadataNodeReducer from '../reducers/metadataNodeReducer';
import storageNodeReducer from '../reducers/storageNodeReducer';
import managementReducer from '../reducers/managementReducer';
import snapshotReducer from '../reducers/snapshotReducer';
import nasReducer from './shareReducer';
import fsOperationReducer from '../reducers/fsOperationReducer';

// firstly correct State with data from environmental parameters and persistent data from localStorage
State.language = lsGet('language') || '';
const {VERSION, NODE_ENV} = process.env;
State.main.general.version = 'v' + VERSION + (NODE_ENV === 'development' ? ' dev' : '');
State.main.general.menuExpand = lsGet('menuExpand');


// export a combined reducer
export default combineReducers({
    // global
    language: (language = State.language, action) => {
        return languageReducer(language, action);
    },

    // initialize
    initialize: (initialize = State.initialize, action) => {
        return initializeReducer(initialize,  action);
    },

    // logged
    main: (main = State.main, action) => {
        let state = {};
        Object.keys(main).forEach(key => {
            switch (key){
                case 'general':
                    state[key] = generalReducer(main[key], action);
                    break;

                case 'metadataNode':
                    state[key] = metadataNodeReducer(main[key], action);
                    break;

                case 'storageNode':
                    state[key] = storageNodeReducer(main[key], action);
                    break;

                case 'management':
                    state[key] = managementReducer(main[key], action);
                    break;

                case 'snapshot':
                    state[key] = snapshotReducer(main[key], action);
                    break;

                case 'nas':
                    state[key] = nasReducer(main[key], action);
                    break;

                case 'fsOperation':
                    state[key] = fsOperationReducer(main[key], action);
                    break;

                default:
                    state[key] = main[key];
            }
        });
        return state;
    },
});