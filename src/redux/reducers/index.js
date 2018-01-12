import {combineReducers} from "redux";
import MockData from "../../mockData";
import languageReducer from "./languageReducer";
import mainReducer from "./mainReducer";

const reducer = combineReducers({
    language: (language = MockData.language, action) => {
        return languageReducer(language, action);
    },
    main: (main = MockData.main, action) => {
        return mainReducer(main,  action);
    }
});

export default reducer;

