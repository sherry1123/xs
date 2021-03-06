import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {Provider} from 'react-redux';
import store from './redux';
import App from './views/App';
import './styleSheets/index.less';
import './socket';
import runCronJob from 'Http/cronJob';
import {lsGet} from './services';
import httpRequests from 'Http/requests';

(async () => {
    // Each time when react app is accessed on browser, should firstly synchronized up system status with server side.
    const NODE_ENV = process.env.NODE_ENV;
    try {
        await httpRequests.syncUpSystemStatus();
        NODE_ENV === 'development' && console.info('%c System status recorded by cookie in browser has been synchronized up with the corresponding status on server side successfully!', 'color: #52a7fe');
    } catch ({msg}){
        console.error('Sync up system status failed: ', msg);
    }

    // run cron job
    runCronJob();

    // Create react app
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

    // Render App
    render(App);

    // Hot module replacement: re-render the App after the modifications of components occurred
    if (module.hot){
        module.hot.accept('./views/App', () => render(App));
    }

    // Some warning tips in production environment
    if (NODE_ENV === 'production'){
        let language = lsGet('language');
        console.info(
            language === 'english' ?
            '%c Warning: For the stable operation of the system, if you are not the operation and maintenance personnel of OrcaFS, don\'t do anything in the Developer Tool!' :
            '%c 警告：为了系统的稳定运行，如果您非OrcaFS的运维人员请勿在开发者工具里执行任何操作！',
            'color: #f15cfd'
        );
    }
})();