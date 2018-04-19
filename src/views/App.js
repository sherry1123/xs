import React, {Component} from 'react';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import {Icon, LocaleProvider, Spin} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import asyncLoad from './asyncLoad';
import lang from '../components/Language/lang';
import {ckGet} from '../services';
import routerPath from './routerPath';

const Initialize = asyncLoad(() => import('./Initialize/Initialize'));
const Login = asyncLoad(() => import('./Login/Login'));
const Main = asyncLoad(() => import('./Main/Main'));
const RollingBack = asyncLoad(() => import('./RollingBack/RollingBack'));
const Error = asyncLoad(() => import('./Error/Error'));

export default class App extends Component {
    constructor (props){
        super(props);
        let isRollingBack = ckGet('rollbacking') === 'true';
        let isInitialized = ckGet('init');
        let defaultPath = '';
        if (isRollingBack){
            defaultPath = `${routerPath.RollingBack}`;
        } else {
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
        }

        this.state = {
            defaultPath,
            isRollingBack
        };
    }

    render (){
        return (
            <HashRouter>
                <LocaleProvider locale={lang(enUS, {})}>
                    <Spin spinning={this.state.isRollingBack}
                        indicator={<Icon type="setting" spin style={{fontSize: 60}} />}
                        tip={lang('快照正在回滚中，暂无法进行任何操作，请稍候 ...', 'Snapshot is rolling back, no operation is allowed to do, please wait ...')}
                    >
                        <Switch>
                            <Route path={routerPath.Init} component={Initialize} />
                            <Route path={routerPath.Login} component={Login} />
                            <Route path={routerPath.Error} component={Error} />
                            <Route path={routerPath.RollingBack} component={RollingBack} />
                            <Route path={routerPath.Main} component={Main} />

                            <Redirect from='/' to={this.state.defaultPath} />
                        </Switch>
                    </Spin>
                </LocaleProvider>
            </HashRouter>
        );
    }
}