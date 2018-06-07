import {combineReducers} from 'redux';
import State from '../state';
import {lsGet} from '../../services';
import languageReducer from './languageReducer';
import initializeReducer from './initializeReducer';
import generalReducer from './generalReducer';
import metadataNodeReducer from './metadataNodeReducer';
import storageNodeReducer from './storageNodeReducer';
import dashboardReducer from './dashboardReducer';
import dataNodeReducer from './dataNodeReducer';
import systemLogReducer from './systemLogReducer';
import snapshotReducer from './snapshotReducer';
import shareReducer from './shareReducer';
import localAuthUserReducer from './localAuthUserReducer';
import targetReducer from './targetReducer';

// firstly correct State with data from environmental parameters and persistent data from localStorage
State.language = lsGet('language') || 'chinese';
State.main.general.menuExpand = !!lsGet('menuExpand');
// no need this, now get the version from backend
// const {VERSION, NODE_ENV} = process.env;
// State.main.general.version = 'v' + VERSION + (NODE_ENV === 'development' ? ' dev' : '');

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

                case 'dashboard':
                    state[key] = dashboardReducer(main[key], action);
                    break;

                case 'dataNode':
                    state[key] = dataNodeReducer(main[key], action);
                    break;

                case 'snapshot':
                    state[key] = snapshotReducer(main[key], action);
                    break;

                case 'share':
                    state[key] = shareReducer(main[key], action);
                    break;

                case 'systemLog':
                    state[key] = systemLogReducer(main[key], action);
                    break;

                case 'localAuthUser':
                    state[key] = localAuthUserReducer(main[key], action);
                    break;

                case 'target':
                    state[key] = targetReducer(main[key], action);
                    break;

                default:
                    state[key] = main[key];
            }
        });
        return state;
    },
});