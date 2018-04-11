import React, {Component} from 'react';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import asyncLoad from './asyncLoad';
import {LocaleProvider} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import lang from '../components/Language/lang';
import {ckGet} from '../services';
import routerPath from './routerPath';

const Initialize = asyncLoad(() => import('./Initialize/Initialize'));
const Login = asyncLoad(() => import('./Login/Login'));
const Main = asyncLoad(() => import('./Main/Main'));
const Error = asyncLoad(() => import('./Error/Error'));

export default class App extends Component {
    constructor (props){
        super(props);
        let isInitialized = ckGet('init');
        let defaultPath = '';
        if (isInitialized === 'true'){
            let isLoggedIn = ckGet('login');
            if (!isLoggedIn){
                defaultPath = routerPath.Login;
            } else {
                defaultPath = `${routerPath.Main}${routerPath.MetadataNodes}`;
            }
        } else {
            defaultPath = routerPath.Init;
        }
        this.state = {
            defaultPath
        };
    }

    render (){
        return (
            <HashRouter>
                <LocaleProvider locale={lang(enUS, {})}>
                    <Switch>
                        <Route path={routerPath.Init} component={Initialize} />
                        <Route path={routerPath.Login} component={Login} />
                        <Route path={routerPath.Error} component={Error} />
                        <Route path={routerPath.Main} component={Main} />

                        <Redirect from='/' to={this.state.defaultPath} />
                    </Switch>
                </LocaleProvider>
            </HashRouter>
        );
    }
}