import State from '../state';
import {generalActionTypes} from '../actions/generalAction';

const generalReducer = (state = State.main.general, action) => {
    switch (action.type){
        case generalActionTypes.SET_VERSION:
            return Object.assign({}, state, {version: action.version});

        case generalActionTypes.SET_USER:
            return Object.assign({}, state, {user: action.user});

        case generalActionTypes.CHANGE_ACTIVE_MENU:
            return Object.assign({}, state, {activeMenu: action.key});

        case generalActionTypes.CHANGE_ACTIVE_PAGE:
            return Object.assign({}, state, {activePage: action.key});

        case generalActionTypes.CHANGE_MENU_EXPAND:
            return Object.assign({}, state, {menuExpand: action.menuExpand});

        case generalActionTypes.SET_KNOWN_PROBLEMS:
            return Object.assign({}, state, {knownProblems: action.knownProblems});

        default:
            return state;
    }
};

export default generalReducer;