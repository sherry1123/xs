import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import store from './redux';
import "./styleSheets/index.less";
import App from "./views/App";
//import './services/socket';
render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('container')
);