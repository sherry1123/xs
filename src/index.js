/*
，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，
，，，，奥奥奥奥，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，奥奥奥奥奥奥，，，，，，，奥奥奥，，，，
，，，奥，，，，奥，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，奥，，，，，，，，，，，奥，，，奥，，，
，，奥，，，，，，奥，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，奥，，，，，，，，，，，奥，，，奥，，，
，，奥，，，，，，奥，，，，，，，，奥奥，，，，，，，，，奥奥奥，，，，，，，，，奥奥，，，，，，，，，奥，，，，，，，，，，，，奥，，，，，，
，，奥，，，，，，奥，，，，，，，奥，，奥，，，，，，，奥，，，奥，，，，，，，奥，，奥，，，，，，，，奥奥奥奥，，，，，，，，，，奥，，，，，
，，奥，，，，，，奥，，，，，，，奥，，，，，，，，，，奥，，，，，，，，，，奥，，，，奥，，，，，，，奥，，，，，，，，，，，，，，奥，，，，
，，奥，，，，，，奥，，，，，，，奥，，，，，，，，，，奥，，，，，，，，，，奥奥奥奥奥奥，，，，，，，奥，，，，，，，，，，，奥，，，奥，，，
，，，奥，，，，奥，，，，，，，，奥，，，，，，，，，，奥，，，奥，，，，，，奥，，，，奥，，，，，，，奥，，，，，，，，，，，奥，，，奥，，，
，，，，奥奥奥奥，，，，，，，，奥奥奥奥，，，，，，，，，奥奥奥，，，，，，，奥，，，，奥，，，，，，奥奥奥奥，，，，，，，，，，奥奥奥，，，，
，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，
 */
import React from "react";
import ReactDOM from "react-dom";
import {AppContainer} from 'react-hot-loader'
import {Provider} from "react-redux";
import store from './redux';
import App from "./views/App";
import "./styleSheets/index.less";
//import './socket';

const render = Component => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <Component />
            </Provider>
        </AppContainer>,
        document.getElementById('container'),
    )
};

render(App);

if (module.hot){
    module.hot.accept('./views/App', () => render(App));
}