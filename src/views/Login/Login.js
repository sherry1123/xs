import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import generalAction from 'Actions/generalAction';
import {Button, Form, Icon, Input, message} from 'antd';
import LanguageButton from 'Components/Language/LanguageButton';
import routerPath from '../routerPath';
import MD5 from 'crypto-js/md5';
// import TripleDES from 'crypto-js/tripledes';
import {ckGet} from 'Services';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    const {language, main: {general: {version}}} = state;
    return {language, version};
};

const mapDispatchToProps = dispatch => ({
    setUser: user => dispatch(generalAction.setUser(user)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Login extends Component {
    constructor (props){
        super(props);
        this.state = {
            // username input value and validation
            username: '',
            usernameStatus: '',
            usernameHelp: '',
            // password input value and validation
            password: '',
            passwordStatus: '',
            passwordHelp: '',
            // login operation
            doingLogin: false,
            loginErrorCode: ''
        };
    }

    componentWillMount (){
        // see router interceptor rule in routerPath.js
        let isDeInit = ckGet('deinit');
        let isReInit = ckGet('reinit');
        let isInitialized = ckGet('init');
        if (isDeInit === 'true' && isInitialized === 'true'){
            this.props.history.replace(routerPath.DeInitializing);
        } else if (isReInit === 'true' && isInitialized === 'true'){
            this.props.history.replace(routerPath.ReInitializing);
        } else {
            let isRollingBack = ckGet('rollbacking');
            if (isRollingBack === 'true' && isInitialized === 'true'){
                this.props.history.replace(routerPath.RollingBack);
            } else {
                if (isInitialized === 'true'){
                    let isLoggedIn = ckGet('login');
                    if (!!isLoggedIn && (isLoggedIn !== 'false')){
                        this.props.history.replace(routerPath.Main + routerPath.Dashboard);
                    }
                } else {
                    this.props.history.replace(routerPath.Init);
                }
            }
        }
    }

    /*
    componentDidMount (){
        // console.info(this.props.history.location);
        let {fromInit} = this.props.history.location.state || {};
        if (fromInit){
            this.changePasswordWrapper.getWrappedInstance().show({isAdmin: true});
        }
    }
    */

    async changeUsername ({target: {value}}) {
        await this.setState({username: value});
        await this.validateUsername(value);
    }

    async validateUsername (value){
        await this.setState({
            usernameStatus: !value ? 'error' : '',
            usernameHelp: !value ? 2 : '',
            loginErrorCode: ''
        });
    }

    async changePassword ({target: {value}}){
        await this.setState({password: value});
        await this.validatePassword(value);
    }

    async validatePassword (value){
        await this.setState({
            passwordStatus: !value ? 'error' : '',
            passwordHelp: !value ? 3 : '',
            loginErrorCode: ''
        });
    }

    async doLogin (){
        let {username, password} = this.state;
        await this.validateUsername(username);
        await this.validatePassword(password);
        let {usernameStatus, passwordStatus} = this.state;
        if (!usernameStatus && !passwordStatus){
            await this.setState({doingLogin: true});
            password = MD5(password).toString();
            // password = TripleDES.encrypt(password, 'orcadt@xian').toString();
            try {
                let user = await httpRequests.login({username, password});
                this.props.setUser(user);
                await this.setState({loginErrorCode: '', doingLogin: false});
                this.props.history.push(routerPath.Main + routerPath.Dashboard);
            } catch ({code}){
                this.setState({loginErrorCode: code, doingLogin: false});
            }
        } else {
            message.warning(lang('请正确输入用户名和密码', 'Please fill up the login form'));
        }
    }

    render (){
        let errorTipMap = {
            2: lang('请输入用户名', 'Please enter username'),
            3: lang('请输入密码', 'Please enter password'),
            1: lang('用户名或密码错误', 'Username or password error'),
        };
        return (
            <section className="fs-login-wrapper">
                <LanguageButton width={80} border="none" login pureText />
                <div>
                    {Object.keys(Array.apply(null, {length: 5})).map((val, i) => (
                        <i className={`fs-login-background-bubble b-${parseInt(i, 10) + 1}`} key={i} />
                    ))}
                </div>
                <div className="fs-login-content-wrapper">
                    <div className="fs-logo-text-content">
                        <div>{lang('OrcaFS提供高安全、高可靠、一致、高效的服务', 'OrcaFS provides high security, high reliability, high performance, consistent, efficient services')}</div>
                        <div>{lang('满足各类存储和高性能计算的需求', 'Meets the needs of storage and high performance computing')}</div>
                    </div>
                    <section className="fs-bubble-logo-wrapper">
                        {Object.keys(Array.apply(null, {length: 120})).map((val, i) => (
                            <i className={`fs-b-b b-${parseInt(i, 10) + 1}`} key={i}><i className="fs-b"/></i>
                        ))}
                    </section>
                    <div className="fs-login-title-content">
                        <div>{lang('OrcaFS管理平台登录', 'OrcaFS Platform Sign In')}</div>
                    </div>
                    <div className="fs-login-form-wrapper">
                        <div className="fs-logo-wrapper" />
                        <Form className="fs-login-form-box">
                            <Form.Item
                                className="fs-login-input-wrapper"
                                validateStatus={this.state.usernameStatus}
                                help={errorTipMap[this.state.usernameHelp]}
                            >
                                <Input
                                    placeholder={lang('用户名', 'Username')}
                                    prefix={<Icon type="user" style={{color: 'rgba(0, 0, 0, .7)'}} />}
                                    value={this.state.username}
                                    onChange={this.changeUsername.bind(this)}
                                    onPressEnter={this.doLogin.bind(this)}
                                />
                            </Form.Item>
                            <Form.Item
                                className="fs-login-input-wrapper password"
                                validateStatus={this.state.passwordStatus}
                                help={errorTipMap[this.state.passwordHelp]}
                            >
                                <Input
                                    placeholder={lang('密码', 'Password')}
                                    type="password"
                                    prefix={<Icon type="lock" style={{color: 'rgba(0, 0, 0, .7)'}} />}
                                    value={this.state.password}
                                    onChange={this.changePassword.bind(this)}
                                    onPressEnter={this.doLogin.bind(this)}
                                />
                            </Form.Item>
                            {
                                this.state.loginErrorCode && <p className="fs-login-error-info-wrapper">
                                    {lang('登录失败：', 'Sign In failed: ')}{errorTipMap[this.state.loginErrorCode]}
                                </p>
                            }
                            <div className="fs-login-btn-box">
                                <Button
                                    className="fs-login-btn"
                                    style={{fontSize: 16}}
                                    type="primary"
                                    icon="login"
                                    loading={this.state.doingLogin}
                                    onClick={this.doLogin.bind(this)}
                                >
                                    {this.state.doingLogin ? lang('登录中...', 'Signing in...') : lang('登录', 'Sign In')}
                                </Button>
                                <div className="fs-login-forget-password-tip">
                                    <Icon type="info-circle-o" /> {lang('如果忘记密码，请联系运维人员协助找回', 'If forget password, ask Q&M personnel for help')}
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </section>
        );
    }
}