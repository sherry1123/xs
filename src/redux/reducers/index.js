import {combineReducers} from 'redux';
import MockData from '../../mockData';
import languageReducer from './languageReducer';
import initializeReducer from './initializeReducer';
import mainReducer from './mainReducer';

const reducer = combineReducers({
    // global
    language: (language = MockData.language, action) => {
        return languageReducer(language, action);
    },
    // initialize
    initialize: (initialize = MockData.initialize, action) => {
        return initializeReducer(initialize,  action);
    },
    // logged
    main: (main = MockData.main, action) => {
        return mainReducer(main,  action);
    }
});

export default reducer;

