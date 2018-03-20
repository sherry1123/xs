import {combineReducers} from 'redux';
import State from '../state';
import {lsGet} from '../../services'
import languageReducer from './languageReducer';
import initializeReducer from './initializeReducer';
import generalReducer from './generalReducer';
import storageNodeReducer from '../reducers/storageNodeReducer';

// firstly read some persistent data from localStorage
State.main.general.menuExpand = lsGet('menuExpand');

const reducer = combineReducers({
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
                case 'storageNode':
                    state[key] = storageNodeReducer(main[key], action);
                    break;
                default:
                    state[key] = main[key];
            }
        });
        return state;
    },
});

export default reducer;

