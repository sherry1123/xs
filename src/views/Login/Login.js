import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message} from 'antd';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';
import Cookie from 'js-cookie';
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
            loginErrorInfo: ''
        };
    }

    componentWillMount (){
        let isInitialized = Cookie.get('init');
        if (isInitialized === 'true'){
            let isLoggedIn = Cookie.get('user');
            if (!!isLoggedIn && (isLoggedIn !== 'false')){
                this.props.history.replace(routerPath.Main + routerPath.MetadataNodesOverview);
            }
        } else {
            this.props.history.replace(routerPath.Init);
        }
    }

    async changeUsername ({target: {value}}) {
        await this.setState({username: value});
        await this.validateUsername(value);
    }

    async validateUsername (value){
        await this.setState({
            usernameStatus: !value ? 'error' : '',
            usernameHelp: !value ? lang('请输入密码', 'please enter username') : ''
        });
    }

    async changePassword ({target: {value}}){
        await this.setState({password: value});
        await this.validatePassword(value);
    }

    async validatePassword (value){
        await this.setState({
            passwordStatus: !value ? 'error' : '',
            passwordHelp: !value ? lang('请输入用户名', 'please enter password') : ''
        });
    }

    async doLogin (){
        let {username, password} = this.state;
        await this.validateUsername(username);
        await this.validatePassword(password);
        let {usernameStatus, passwordStatus} = this.state;
        if (!usernameStatus && !passwordStatus){
            if (process.env.NODE_ENV === 'development'){
                Cookie.set('user', 'dev_user');
            }
            // fetch login interface

            this.props.history.push(routerPath.Main + routerPath.MetadataNodesOverview);
        } else {
            message.warning(lang('请正确输入用户名和密码', 'please fill the form'));
        }
    }

    render (){
        return (
            <section className="fs-login-wrapper">
                <LanguageButton />
                <section className="fs-login-content">
                    <section className="fs-login-logo-wrapper">
                        <img alt="" src="../../images/logo.jpeg" />
                    </section>
                    <section className="fs-login-description-wrapper">
                        {lang('OrcaFS - 全闪存并行文件存储系统', 'OrcaFS - All flash parallel file storage system')}
                    </section>
                    <section>
                        <Form className="fs-login-form-wrapper">
                            <Form.Item className="fs-login-username-input-wrapper"
                                validateStatus={this.state.usernameStatus}
                                help={this.state.usernameHelp}
                            >
                                <Input placeholder={lang('请输入用户名', 'enter username')}
                                    prefix={<Icon type="user" style={{color: 'rgba(0, 0, 0, .25)'}} />}
                                    value={this.state.username}
                                    onChange={this.changeUsername.bind(this)}
                                />
                            </Form.Item>
                            <Form.Item
                                validateStatus={this.state.passwordStatus}
                                help={this.state.passwordHelp}
                            >
                                <Input placeholder={lang('请输入密码', 'enter password')}
                                   type="password"
                                    prefix={<Icon type="lock" style={{color: 'rgba(0, 0, 0, .25)'}} />}
                                    value={this.state.password}
                                    onChange={this.changePassword.bind(this)}
                                />
                            </Form.Item>
                            <Button className="fs-login-btn"
                                type="primary"
                                onClick={this.doLogin.bind(this)}
                            >
                                {lang('登录', 'Login')}
                            </Button>
                        </Form>
                    </section>
                </section>
                <footer className="fs-login-copyright-wrapper">
                    ©2018 Orcadt
                </footer>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(Login);