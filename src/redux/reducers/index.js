import {combineReducers} from "redux";
import MockData from "../../mockData";
import languageReducer from "./languageReducer";

const reducer = combineReducers({
    language: (language = MockData.language, action) => {
        return languageReducer(language, action);
    }
});

export default reducer;

