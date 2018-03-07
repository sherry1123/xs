import State from '../state';
import {mainActionTypes} from '../actions/mainAction';

const mainReducer = (state = State.main, action) => {
    switch (action.type){
        case mainActionTypes.CHANGE_ACTIVE_MENU:
            return Object.assign({}, state, {activeMenu: action.key});

        case mainActionTypes.CHANGE_ACTIVE_PAGE:
            return Object.assign({}, state, {activePage: action.key});

        case mainActionTypes.CHANGE_MENU_EXPAND:
            return Object.assign({}, state, {menuExpand: action.menuExpand});

        default:
            return state;
    }
};

export default mainReducer;