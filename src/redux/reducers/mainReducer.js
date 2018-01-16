import MockData from '../../mockData';
import {mainActionTypes} from '../actions/mainAction';

const mainReducer = (state = MockData.main, action) => {
    switch (action.type){
        case mainActionTypes.CHANGE_ACTIVE_MENU:
            return Object.assign({}, state, {activeMenu: action.key});
        case mainActionTypes.CHANGE_ACTIVE_PAGE:
            return Object.assign({}, state, {activePage: action.key});
        default:
            return state;
    }
};

export default mainReducer;