import React from "react";
import ReactDOM from "react-dom";
import {AppContainer} from 'react-hot-loader'
import {Provider} from "react-redux";
import store from './redux';
import App from "./views/App";
import "./styleSheets/index.less";
import './socket';
import './http/cronJob';
import httpRequests from "./http/requests";

(async () => {
    // each time access the page should firstly fetch 'syncUpSystemStatus' api to sync up
    // initialization and login status recorded in browser cookie with http server before
    // react app created, it will help react components to do exact system status verifications.
    try {
        await httpRequests.syncUpSystemStatus();
        console.log('%c System status in browser cookie has been synchronized with http server!', 'color: #00cc00');
    } catch ({message}){
        console.info('Sync up system status failed: ', message);
    }

    // create react app
    const render = Component => {
        ReactDOM.render(
            <AppContainer>
                <Provider store={store}>
                    <Component />
                </Provider>
            </AppContainer>,
            document.getElementById('root'),
        )
    };

    render(App);

    if (module.hot){
        module.hot.accept('./views/App', () => render(App));
    }
})();