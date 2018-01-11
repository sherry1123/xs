import React, {Component} from 'react';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import Login from './Login/Login';
import Init from './Initialize/Initialize';
import Main from './Main/Main';
import routerPath from './routerPath';

export default class App extends Component {
    constructor (props){
        super(props);
        this.state = {
            defaultPath: `${routerPath.Main}${routerPath.User}`
        };
    }

    render (){
        return (
            <HashRouter>
                <Switch>
                    <Route path={routerPath.Init} component={Init} />
                    <Route path={routerPath.Login} component={Login} />
                    <Route path={routerPath.Error} component={Error} />
                    <Route path={routerPath.Main} component={Main} />

                    <Redirect from='/' to={this.state.defaultPath} />
                </Switch>
            </HashRouter>
        );
    }
}