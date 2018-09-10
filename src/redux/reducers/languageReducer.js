import State from '../state';
import {languageActionTypes} from 'Actions/languageAction';

const languageReducer = (state = State.language, action) => {
    switch (action.type){
        case languageActionTypes.CHANGE_LANGUAGE:
            return action.language;
            
        default:
            return state;
    }
};

export default languageReducer;