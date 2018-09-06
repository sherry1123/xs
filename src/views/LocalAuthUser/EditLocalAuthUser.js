import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Switch} from 'antd';
import SelectLocalAuthUserGroup from './SelectLocalAuthUserGroup';
import lang from 'Components/Language/lang';
import {validateFsName, validatePassword} from 'Services';
import httpRequests from 'Http/requests';

class EditLocalAuthUser extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: true,
            formSubmitting: false,
            changePassword: false,
            userData: {},
            validation: {
                password: {status: '', help: '', valid: true},
                rePassword: {status: '', help: '', valid: true},
                primaryGroup: {status: '', help: '', valid: true},
            },
        };
    }

    formValueChange (key, value){
        let userData = {[key]: value};
        userData = Object.assign({}, this.state.userData, userData);
        this.setState({userData});
    }

    async validationUpdateState (key, value, valid){
        let {cn, en} = value;
        let validation = {
            [key]: {
                status: (cn || en) ? 'error' : '',
                help: lang(cn, en),
                valid
            }
        };
        validation = Object.assign({}, this.state.validation, validation);
        await this.setState({validation});
    }

    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {name, password, rePassword, primaryGroup} = this.state.userData;
        if (key === 'name'){
            if (!name){
                this.validationUpdateState('name', {cn: '请输入用户姓名', en: 'Please enter username'}, false);
            } else if (!validateFsName(name)){
                this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度3-30位',
                    en: 'Name can only contains letter, number and underscore(except for the first place), length is 3-30'
                }, false);
            }
        }
        if (key === 'password'){
            if (!password){
                await this.validationUpdateState('password', {cn: '请输入新密码', en: 'Please enter new password'}, false);
            } else if (!validatePassword(password)){
                await this.validationUpdateState('password',  {
                    cn: '密码仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度6-18位',
                    en: 'Password can only contains letter, number and underscore(except for the first), length is 6-18'
                }, false);
            } else {
                if (password !== rePassword){
                    await this.validationUpdateState('rePassword', {cn: '两次密码输入不一致', en: 'Please enter two consistent passwords'}, false);
                } else {
                    await this.validationUpdateState('rePassword', {cn: '', en: ''}, true);
                }
            }
        }
        if (key === 'rePassword'){
            if (!rePassword){
                await this.validationUpdateState('rePassword', {cn: '请再次输入新密码', en: 'Please enter new password again'}, false);
            } else if (password !== rePassword){
                await this.validationUpdateState('rePassword', {cn: '两次密码输入不一致', en: 'Please enter two consistent passwords'}, false);
            }
        }
        if (key === 'primaryGroup'){
            if (!primaryGroup){
                await this.validationUpdateState('primaryGroup', {cn: '请选择主组', en: 'Please select the primary group'}, false);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async edit (){
        let userData = Object.assign({}, this.state.userData, {changePassword: this.state.changePassword});
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateLocalAuthUser(userData);
            httpRequests.getLocalAuthUserList();
            await this.hide();
            message.success(lang(`编辑本地认证用户 ${userData.name} 成功!`, `Edit local authentication user ${userData.name} successfully!`));
        } catch ({msg}){
            message.error(lang(`编辑本地认证用户 ${userData.name} 失败, 原因: `, `Edit local authentication user ${userData.name} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    async switchChangePassword (value){
        await this.setState({changePassword: value});
        let validation = Object.assign({}, this.state.validation);
        if (value){
            validation.password = {status: '', help: '', valid: false};
            validation.rePassword = {status: '', help: '', valid: false};
        } else {
            validation.password = {status: '', help: '', valid: true};
            validation.rePassword = {status: '', help: '', valid: true};
        }
        await this.setState({validation});
        this.validateForm(value ? 'password' : 'primaryGroup');
    }

    showSelectPrimaryGroup (){
        this.selectLocalAuthUserGroupWrapper.getWrappedInstance().show(false, this.state.userData.primaryGroup);
    }

    selectGroup ({type, groupNames}){
        console.info(type, groupNames);
        if (type === 'primaryGroup'){
            groupNames = groupNames[0];
        }
        this.formValueChange(type, groupNames);
        if (type === 'primaryGroup'){
            this.validateForm(type);
        }
    }

    show (userData){
        delete userData.password;
        this.setState({
            visible: true,
            formValid: true,
            formSubmitting: false,
            changePassword: false,
            userData,
            validation: {
                rePassword: {status: '', help: '', valid: true},
                password: {status: '', help: '', valid: true},
                primaryGroup: {status: '', help: '', valid: true},
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 4 : 6},
                sm: {span: isChinese ? 4 : 6},
            },
            wrapperCol: {
                xs: {span: isChinese ? 20 : 18},
                sm: {span: isChinese ? 20 : 18},
            }
        };
        return (
            <Modal
                title={lang('编辑本地认证用户', 'Edit Local Authentication User')}
                width={400}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.edit.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('用户名', 'Username')}>
                        {this.state.userData.name}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('修改密码', 'Change Password')}>
                        <Switch
                            size="small"
                            checked={this.state.changePassword}
                            onChange={value => this.switchChangePassword.bind(this, value)()}
                        />
                    </Form.Item>
                    {
                        this.state.changePassword && <Form.Item
                            {...formItemLayout}
                            label={lang('新密码', 'New Password')}
                            validateStatus={this.state.validation.password.status}
                            help={this.state.validation.password.help}
                        >
                            <Input
                                style={{width: isChinese ? 280 : 260}} size="small"
                                type="password"
                                placeholder={lang('请输入密码', 'Please enter the password')}
                                value={this.state.userData.password}
                                onChange={({target: {value}}) => {
                                    this.formValueChange.bind(this, 'password', value)();
                                    this.validateForm.bind(this, 'password')();
                                }}
                            />
                        </Form.Item>
                    }
                    {
                        this.state.changePassword && <Form.Item
                            {...formItemLayout}
                            label={lang('确认密码', 'Confirm')}
                            validateStatus={this.state.validation.rePassword.status}
                            help={this.state.validation.rePassword.help}
                        >
                            <Input
                                style={{width: isChinese ? 280 : 260}} size="small"
                                type="password"
                                placeholder={lang('请再次输入密码', 'Please enter password again')}
                                value={this.state.userData.rePassword}
                                onChange={({target: {value}}) => {
                                    this.formValueChange.bind(this, 'rePassword', value)();
                                    this.validateForm.bind(this, 'rePassword')();
                                }}
                            />
                        </Form.Item>
                    }
                    <Form.Item
                        {...formItemLayout}
                        label={lang('主组', 'Primary Group')}
                        validateStatus={this.state.validation.primaryGroup.status}
                        help={this.state.validation.primaryGroup.help}
                    >
                        <Input
                            style={{width: isChinese ? 280 : 260}} size="small"
                            readOnly
                            placeholder={lang('请选择主组', 'Please select the primary group')}
                            value={this.state.userData.primaryGroup}
                            addonAfter={
                                <Icon
                                    type="usergroup-add"
                                    style={{cursor: 'pointer'}}
                                    onClick={this.showSelectPrimaryGroup.bind(this)}
                                />
                            }
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('附属组', 'Secondary Group')}>
                        {(this.state.userData.secondaryGroup || []).join(',') || '--'}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 280 : 260}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={200}
                            placeholder={lang('描述为选填项，长度0-200位', 'Description is optional, length is 0-200')}
                            value={this.state.userData.description}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'description')(value);
                            }}
                        />
                    </Form.Item>
                </Form>
                <SelectLocalAuthUserGroup onSelectGroup={this.selectGroup.bind(this)} ref={ref => this.selectLocalAuthUserGroupWrapper = ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditLocalAuthUser);