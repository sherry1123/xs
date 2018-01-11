import MockData from '../../mockData';
import {languageActionTypes} from '../actions/languageAction';

const languageReducer = (state = MockData['language'], action) => {
    switch (action.type){
        case languageActionTypes.CHANGE:
            return action.language;
        default:
            return state;
    }
};

export default languageReducer;