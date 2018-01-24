import React from "react";
import {render} from "react-dom";
import {AppContainer} from 'react-hot-loader'
import {Provider} from "react-redux";
import store from './redux';
import "./styleSheets/index.less";
import App from "./views/App";
//import './services/socket';

render(
    <AppContainer>
        <Provider store={store}>
            <App />
        </Provider>
    </AppContainer>,
    document.getElementById('container')
);

// Webpack Hot Module Replacement API
if (module.hot) {
    console.info(3333333);
    module.hot.accept('./views/App', () => { render(App) })
}