import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Input, Form, message, Modal} from 'antd';
import lang from '../../components/Language/lang';
import mainAction from '../../redux/actions/generalAction';
import httpRequests from '../../http/requests';
import {validatePassword} from "../../services";

class UserSettingPopover extends Component {
    constructor (props){
        super(props);
        this.state = {
            // form
            visible: false,
            formValid: false,
            formSubmitting: false,
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
        let {password, rePassword} = this.state.formData;
        if (key === 'password'){
            if (!password){
                await this.validationUpdateState('password', {
                    cn: '请输入新密码',
                    en: 'please enter new password'
                }, false);
            } else if (!validatePassword(password)){
                await this.validationUpdateState('password', {
                    cn: '请输入6至21位数字',
                    en: 'please enter 6 to 21 digits'
                }, false);
            } else {
                if (password !== rePassword){
                    await this.validationUpdateState('rePassword', {
                        cn: '两次密码输入不一致',
                        en: 'please enter two consistent passwords'
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
                    en: 'please enter new password again'
                }, false);
            } else if (password !== rePassword){
                await this.validationUpdateState('rePassword', {
                    cn: '两次密码输入不一致',
                    en: 'please enter two consistent passwords'
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

    show (){
        this.setState({
            visible: true,
            formSubmitting: false,
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
        // there's no need to forward to Login manually since we will verify
        // the status in cookie when each fetch request get the response
        httpRequests.logout(this.props.user);
    }

    render (){
        return (
            <div style={{padding: '5px 0'}}>
                <Button size="small" icon="lock" onClick={this.show.bind(this)}>
                    {lang('修改密码', 'Change Password')}
                </Button>
                <br/>
                <Button size="small" icon="logout" onClick={this.logout.bind(this)} style={{marginTop: 10}}>
                    {lang('注销', 'Logout')}
                </Button>
                <Modal title={lang('修改密码', 'Change Password')}
                    width={320}
                    visible={this.state.visible}
                    closable={false}
                    maskClosable={false}
                    footer={
                        <div>
                            <Button type="primary" disabled={!this.state.formValid} loading={this.state.formSubmitting}
                                size='small' onClick={this.changePassword.bind(this)}
                            >
                                {lang('修改', 'Change')}
                            </Button>
                            <Button size='small' onClick={this.hide.bind(this)}>
                                {lang('取消', 'Cancel')}
                            </Button>
                        </div>
                    }
                >
                    <Form>
                        <Form.Item label={lang('用户名', 'Username')}>
                            <Input style={{width: 270}} size='small' disabled readOnly
                                value={this.props.user.username}
                            />
                        </Form.Item>
                        <Form.Item label={lang('新密码', 'New Password')}
                            validateStatus={this.state.validation.password.status}
                            help={this.state.validation.password.help}
                        >
                            <Input style={{width: 270}} size='small'
                                placeholder={lang('请输入新密码', 'please enter new password')}
                                value={this.state.formData.password}
                                onChange={({target: {value}}) => {
                                    this.formValueChange.bind(this, 'password')(value);
                                    this.validateForm.bind(this)('password');
                                }}
                            />
                        </Form.Item>
                        <Form.Item label={lang('确认新密吗', 'Confirm New Password')}
                            validateStatus={this.state.validation.rePassword.status}
                            help={this.state.validation.rePassword.help}
                        >
                            <Input style={{width: 270}} size='small'
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
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {general: {user}}} = state;
    return {language, user};
};

const mapDispatchToProps = dispatch => {
    return {
        changeActivePage: key => dispatch(mainAction.changeActivePage(key))
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(UserSettingPopover);