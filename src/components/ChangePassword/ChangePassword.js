import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Input, message, Modal} from 'antd';
import httpRequests from '../../http/requests';
import lang from '../Language/lang';
import {validatePassword} from '../../services';
import MD5 from 'crypto-js/md5';
import TripleDES from 'crypto-js/tripledes';

class ChangePassword  extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            isAdmin: false,
            adminDefaultPassword: '123456',
            formData: {
                password: '',
                rePassword: ''
            },
            validation: {
                password: {status: '', help: '', valid: false},
                rePassword: {status: '', help: '', valid: false}
            }
        };
    }

    formValueChange (key, value){
        let formData = Object.assign({}, this.state.formData, {[key]: value});
        this.setState({formData});
    }

    async validateForm (key){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
        await this.setState({validation});
        let {adminDefaultPassword, formData: {password, rePassword}} = this.state;
        if (key === 'password'){
            if (!password){
                await this.validationUpdateState('password', {
                    cn: '请输入新密码',
                    en: 'please enter new password'
                }, false);
            } else if (!validatePassword(password)){
                await this.validationUpdateState('password', {
                    cn: '请输入6至21位数字',
                    en: 'Please enter 6 to 21 digits'
                }, false);
            } else if (password === adminDefaultPassword){
                await this.validationUpdateState('password', {
                    cn: '密码不能和默认密码相同',
                    en: 'Password can\'t be the same with default password'
                }, false);
            } else {
                if (password !== rePassword){
                    await this.validationUpdateState('rePassword', {
                        cn: '两次密码输入不一致',
                        en: 'Please enter two consistent passwords'
                    }, false);
                } else {
                    await this.validationUpdateState('rePassword', {cn: '', en: ''}, true);
                }
            }
        }
        if (key === 'rePassword'){
            if (!rePassword){
                await this.validationUpdateState('rePassword', {
                    cn: '请再次输入新密码',
                    en: 'Please enter new password again'
                }, false);
            } else if (password !== rePassword){
                await this.validationUpdateState('rePassword', {
                    cn: '两次密码输入不一致',
                    en: 'Please enter two consistent passwords'
                }, false);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async validationUpdateState (key, value, valid){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: (value.cn || value.en) ? 'error' : '', help: lang(value.cn, value.en), valid: valid}});
        await this.setState({validation});
    }

    async changePassword (){
        let {username} = this.props.user;
        let {password} = this.state.formData;
        password = MD5(password).toString();
        password  = TripleDES.encrypt(password, 'orcadt@xian').toString();
        await this.setState({formSubmitting: true});
        try {
            await httpRequests.updateUser({username, password});
            await this.hide();
            this.logout();
            message.success(lang(`用户 ${username} 密码修改成功，请使用新密码重新登录！`, `The password of user ${username} has been changed successfully, please use the new password to do re-login!`));
        } catch ({msg}){
            message.success(lang(`用户 ${username} 密码修改失败，原因：`, `Change the password of user ${username} change failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (options = {}){
        let {isAdmin} = options;
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            isAdmin,
            formData: {
                password: '',
                rePassword: ''
            },
            validation: {
                password: {status: '', help: '', valid: false},
                rePassword: {status: '', help: '', valid: false}
            }
        });
    }

    hide (){
        this.setState({visible: false});
    }

    logout (){
        // it doesn't demand that jump to Login page manually, since each HTTP fetch will verify the system status
        // from cookie after itself gets the response from server, if need, will do the jumping operation automatically.
        httpRequests.logout(this.props.user);
    }

    render (){
        let {isAdmin} = this.state;
        let title = isAdmin ?
            lang('修改管理员用户的初始密码', 'Change Initial Password Of Administrator') :
            lang('修改密码', 'Change Password');
        let username = isAdmin ? 'admin' : this.props.user.username;

        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 6 : 8},
                sm: {span: isChinese ? 6 : 8},
            },
            wrapperCol: {
                xs: {span: isChinese ? 18 : 16},
                sm: {span: isChinese ? 18 : 16},
            }
        };
        return (
            <Modal
                title={title}
                width={400}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                footer={
                    <div>
                        {
                            !isAdmin &&
                            <Button size='small' onClick={this.hide.bind(this)}>
                                {lang('取消', 'Cancel')}
                            </Button>
                        }
                        <Button
                            type="primary" size='small'
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.changePassword.bind(this)}
                        >
                            {lang('修改', 'Change')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('用户名', 'Username')}>
                        <Input style={{width: 230}} size='small' disabled readOnly value={username} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                       label={lang('新密码', 'New Password')}
                        validateStatus={this.state.validation.password.status}
                        help={this.state.validation.password.help}
                    >
                        <Input
                            style={{width: 230}} size='small'
                            placeholder={lang('请输入新密码', 'please enter new password')}
                            value={this.state.formData.password}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'password')(value);
                                this.validateForm.bind(this)('password');
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('确认新密吗', 'Confirm Password')}
                        validateStatus={this.state.validation.rePassword.status}
                        help={this.state.validation.rePassword.help}
                    >
                        <Input
                            style={{width: 230}} size='small'
                            placeholder={lang('请再次输入新密码', 'please enter new password again')}
                            value={this.state.formData.rePassword}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'rePassword')(value);
                                this.validateForm.bind(this)('rePassword');
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {general: {user}}} = state;
    return {language, user};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(ChangePassword);