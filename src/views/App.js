import React, {Component} from 'react';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import {LocaleProvider} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import lang from '../components/Language/lang';
import Init from './Initialize/Initialize';
import Login from './Login/Login';
import Main from './Main/Main';
import Error from './Error/Error';
import Cookie from 'js-cookie';
import routerPath from './routerPath';

export default class App extends Component {
    constructor (props){
        super(props);
        let isInitialized = Cookie.get('init');
        let defaultPath = '';
        if (isInitialized === 'true'){
            defaultPath = `${routerPath.Main}${routerPath.MetadataNodesOverview}`;
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
                        <Route path={routerPath.Init} component={Init} />
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