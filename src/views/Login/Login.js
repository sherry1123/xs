import React, {Component} from 'react';
import {connect} from 'react-redux';
import generalAction from '../../redux/actions/generalAction';
import {Button, Form, Icon, Input, message} from 'antd';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';
import routerPath from "../routerPath";
import httpRequests from "../../http/requests";

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
                this.props.history.push(routerPath.Main + routerPath.Dashboard);
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
                <LanguageButton width={80} login border="none" pureText />
                <i className="fs-login-background-bubble b-1" />
                <i className="fs-login-background-bubble b-2" />
                <i className="fs-login-background-bubble b-3" />
                <i className="fs-login-background-bubble b-4" />
                <i className="fs-login-background-bubble b-5" />

                <div className="fs-login-content-wrapper">
                    <div className="fs-logo-text-content">
                        <div>{lang('奥卡云OrcaFS存储奥卡云OrcaFS存储奥卡云OrcaFS存储', '')}</div>
                        <div>{lang('我们提供了高效、安全、稳定、可靠的系统，用于存储和高性能计算领域', '')}</div>
                    </div>
                    <section className="fs-bubble-logo-wrapper">
                        {Object.keys(Array.apply(null, {length: 120})).map(i => (
                            <i className={`fs-b-b b-${parseInt(i, 10) + 1}`} key={i}><i className="fs-b"/></i>
                        ))}
                    </section>
                    <div className="fs-login-title-content">
                        <div>{lang('OrcaFS管理平台登录', 'OrcaFS Management Platform Login')}</div>
                    </div>
                    <div className="fs-login-form-wrapper">
                        <div className="fs-logo-wrapper" />
                        <Form className="fs-login-form-box">
                            <Form.Item
                                className="fs-login-input-wrapper"
                                validateStatus={this.state.usernameStatus}
                                help={this.state.usernameHelp}
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
                                className="fs-login-input-wrapper"
                                validateStatus={this.state.passwordStatus}
                                help={this.state.passwordHelp}
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
                            <Button
                                className="fs-login-btn"
                                style={{fontSize: 16}}
                                type="primary"
                                icon="login"
                                loading={this.state.doingLogin}
                                onClick={this.doLogin.bind(this)}
                            >
                                {this.state.doingLogin ? lang('登录中...', 'Logging in...') : lang('登录', 'Login')}
                            </Button>
                            {
                                this.state.loginErrorCode && <p className="fs-login-error-info-wrapper">
                                    {lang('登录失败：', 'Login failed: ')}{loginErrorInfoMap[this.state.loginErrorCode]}
                                </p>
                            }
                        </Form>
                    </div>
                </div>
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