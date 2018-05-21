import React, {Component} from 'react';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import {LocaleProvider} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import asyncLoad from './asyncLoad';
import lang from '../components/Language/lang';
import {ckGet, lsRemove} from '../services';
import routerPath from './routerPath';

const Initialize = asyncLoad(() => import('./Initialize/Initialize'));
const Login = asyncLoad(() => import('./Login/Login'));
const Main = asyncLoad(() => import('./Main/Main'));
const RollingBack = asyncLoad(() => import('./RollingBack/RollingBack'));
const DeInitializing = asyncLoad(() => import('./DeInitializing/DeInitializing'));
const Error = asyncLoad(() => import('./Error/Error'));

export default class App extends Component {
    constructor (props){
        super(props);
        let defaultPath = '';
        let isDeInit = ckGet('deInit');
        let isInitialized = ckGet('init');
        if (isDeInit === 'true' && isInitialized === 'true'){
            defaultPath = `${routerPath.DeInitializing}`;
        } else {
            let isRollingBack = ckGet('rollbacking');
            if (isRollingBack  === 'true' && isInitialized === 'true'){
                defaultPath = `${routerPath.RollingBack}`;
            } else {
                if (isInitialized === 'true'){
                    lsRemove(['initStep', 'initStatus', 'initInfoList']);
                    let isLoggedIn = ckGet('login');
                    if (!isLoggedIn){
                        defaultPath = routerPath.Login;
                    } else {
                        defaultPath = `${routerPath.Main}${routerPath.Dashboard}`;
                    }
                } else {
                    defaultPath = routerPath.Init;
                }
            }
        }


        this.state = {
            defaultPath
        };
    }

    render (){
        return (
            <HashRouter>
                <LocaleProvider locale={lang(zhCN, enUS)}>
                    <Switch>
                        <Route path={routerPath.DeInitializing} component={DeInitializing} />
                        <Route path={routerPath.RollingBack} component={RollingBack} />
                        <Route path={routerPath.Init} component={Initialize} />
                        <Route path={routerPath.Login} component={Login} />
                        <Route path={routerPath.Main} component={Main} />
                        <Route path={routerPath.Error} component={Error} />

                        <Redirect from={routerPath.Root} to={this.state.defaultPath} />
                    </Switch>
                </LocaleProvider>
            </HashRouter>
        );
    }
}