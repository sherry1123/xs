import React, {Component} from 'react';
import {connect} from 'react-redux';
import generalAction from "../../redux/actions/generalAction";
import {Button, Form, Icon, Input, message} from 'antd';
import QueueAnim from 'rc-queue-anim';
import ChangePassword from '../../components/ChangePassword/ChangePassword';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';
import {ckGet} from '../../services';
import httpRequests from '../../http/requests';
import routerPath from '../routerPath';

class Login extends Component {
    constructor (props){
        super(props);
        this.state = {
            username: '',
            usernameStatus: '',
            usernameHelp: '',

            password: '',
            passwordStatus: '',
            passwordHelp: '',

            doingLogin: false,
            loginErrorCode: ''
        };
    }

    componentWillMount (){
        // see router interceptor rule in routerPath.js
        let isDeInit = ckGet('deInit');
        let isInitialized = ckGet('init');
        if (isDeInit === 'true' && isInitialized === 'true'){
            this.props.history.replace(routerPath.DeInitializing);
        } else {
            let isRollingBack = ckGet('rollbacking');
            if (isRollingBack === 'true' && isInitialized === 'true'){
                this.props.history.replace(routerPath.RollingBack);
            } else {
                if (isInitialized === 'true'){
                    let isLoggedIn = ckGet('login');
                    if (!!isLoggedIn && (isLoggedIn !== 'false')){
                        this.props.history.replace(routerPath.Main + routerPath.MetadataNodes);
                    }
                } else {
                    this.props.history.replace(routerPath.Init);
                }
            }
        }
    }

    componentDidMount (){
        // console.info(this.props.history.location);
        let {fromInit} = this.props.history.location.state || {};
        if (fromInit){
            this.changePasswordWrapper.getWrappedInstance().show({isAdmin: true});
        }
    }

    async changeUsername ({target: {value}}) {
        await this.setState({username: value});
        await this.validateUsername(value);
    }

    async validateUsername (value){
        await this.setState({
            usernameStatus: !value ? 'error' : '',
            usernameHelp: !value ? lang('请输入密码', 'please enter username') : '',
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
            passwordHelp: !value ? lang('请输入用户名', 'please enter password') : '',
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
            // request login http interface
            try {
                let user = await httpRequests.login({username, password});
                this.props.setUser(user);
                await this.setState({loginErrorCode: '', doingLogin: false});
                this.props.history.push(routerPath.Main + routerPath.StorageNodes);
            } catch ({code}){
                this.setState({loginErrorCode: code, doingLogin: false});
            }
        } else {
            message.warning(lang('请正确输入用户名和密码', 'please fill login form'));
        }
    }

    render (){
        let loginErrorInfoMap = {
            51: lang('用户名或密码错误', 'username or password error')
        };
        return (
            <section className="fs-login-wrapper">
                <LanguageButton width={80} border="none" pureText />
                <QueueAnim type="top" delay={100}>
                    <section key="fd" className="fs-login-content">
                        <div className="fs-login-logo-wrapper" >
                            <div className="rock-bg">
                                <i className="rock-point a" />
                                <i className="rock-point b" />
                                <i className="rock-point c" />
                                <i className="rock-point d" />
                            </div>
                        </div>
                        {/*
                        <section className="fs-login-description-wrapper">
                            {lang('全闪存并行文件存储系统', 'All flash parallel file storage system')}
                        </section>
                        */}
                        <section>
                            <Form className="fs-login-form-wrapper">
                                <Form.Item className="fs-login-username-input-wrapper"
                                    validateStatus={this.state.usernameStatus}
                                    help={this.state.usernameHelp}
                                >
                                    <Input placeholder={lang('用户名', 'Username')}
                                        prefix={<Icon type="user" style={{color: 'rgba(0, 0, 0, .7)'}} />}
                                        value={this.state.username}
                                        onChange={this.changeUsername.bind(this)}
                                        onPressEnter={this.doLogin.bind(this)}
                                    />
                                </Form.Item>
                                <Form.Item
                                    validateStatus={this.state.passwordStatus}
                                    help={this.state.passwordHelp}
                                >
                                    <Input placeholder={lang('密码', 'Password')}
                                       type="password"
                                        prefix={<Icon type="lock" style={{color: 'rgba(0, 0, 0, .7)'}} />}
                                        value={this.state.password}
                                        onChange={this.changePassword.bind(this)}
                                        onPressEnter={this.doLogin.bind(this)}
                                    />
                                </Form.Item>
                                <Button className="fs-login-btn" type="primary" loading={this.state.doingLogin} onClick={this.doLogin.bind(this)}>
                                    {this.state.doingLogin ? lang('登录中...', 'Logging in...') : lang('登录', 'Login')}
                                </Button>
                                {
                                    this.state.loginErrorCode && <p className="fs-login-error-info-wrapper">
                                        {lang('登录失败：', 'Login failed: ')}{loginErrorInfoMap[this.state.loginErrorCode]}
                                    </p>
                                }
                            </Form>
                        </section>
                    </section>
                </QueueAnim>
                <ChangePassword ref={ref => this.changePasswordWrapper = ref} />
                <footer className="fs-login-copyright-wrapper">
                    ©2018 Orcadt {this.props.version}
                </footer>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {general: {version}}} = state;
    return {language, version};
};

const mapDispatchToProps = dispatch => {
    return {
        setUser: user => dispatch(generalAction.setUser(user)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);