import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {Provider} from 'react-redux';
import store from './redux';
import App from './views/App';
import './styleSheets/index.less';
import './socket';
import './http/cronJob';
import {lsGet} from './services';
import httpRequests from "./http/requests";

(async () => {
    const NODE_ENV = process.env.NODE_ENV;
    // each time when user accesses should firstly fetch 'syncUpSystemStatus' api to sync up
    // rollback, initialization and login status recorded in browser cookie with http server before
    // react app created, it will help react components to do exact system status verifications.
    // currently, there're four interceptions on system status check from cookie, ranking by weight:
    // 1. deInit
    // 2. rollbacking
    // 3. init
    // 4. login
    try {
        await httpRequests.syncUpSystemStatus();
        NODE_ENV === 'development' && console.info('%c System status recorded by cookie in browser has been synchronized up with the corresponding status on server side successfully!', 'color: #52a7fe');
    } catch ({msg}){
        console.error('Sync up system status failed: ', msg);
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
        );
    };

    render(App);

    if (module.hot){
        // hot replace the APP when the modifications of component occur
        module.hot.accept('./views/App', () => render(App));
    }

    if (NODE_ENV === 'production'){
        let language = lsGet('language');
        console.info(
            language === 'english' ?
            '%c Warning: For the stable operation of the system, if you are not the operation and maintenance personnel of OrcaFS, don\'t do anything in the Developer Tool!' :
            '%c 警告：为了系统的稳定运行，如果您非OrcaFS的运维人员请勿在开发者工具里做任何操作！',
            'color: #f15cfd'
        );
    }
})();