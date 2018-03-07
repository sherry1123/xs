import {combineReducers} from 'redux';
import State from '../state';
import languageReducer from './languageReducer';
import initializeReducer from './initializeReducer';
import mainReducer from './mainReducer';

let menuExpand = localStorage.getItem('menuExpand') !== 'false';
State.main.menuExpand = menuExpand;

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
        return mainReducer(main,  action);
    },
});

export default reducer;

