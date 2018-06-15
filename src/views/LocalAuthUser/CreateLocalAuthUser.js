import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Popover} from 'antd';
import SelectLocalAuthUserGroup from './SelectLocalAuthUserGroup';
import lang from '../../components/Language/lang';
import {validateFsName} from '../../services/index';
import httpRequests from '../../http/requests';
import {validatePassword} from '../../services';

class CreateLocalAuthUser extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            userData: {
                name: '',
                password: '',
                rePassword: '',
                primaryGroup: '',
                secondaryGroup: [],
                description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
                password: {status: '', help: '', valid: false},
                rePassword: {status: '', help: '', valid: false},
                primaryGroup: {status: '', help: '', valid: false},
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
            let isNameDuplicated = this.props.localAuthUserList.some(user => user.name === name);
            if (isNameDuplicated){
                this.validationUpdateState('name', {
                    cn: '该名称已被使用',
                    en: 'This name has already been used'
                }, false);
            }
        }
        if (key === 'password'){
            if (!password){
                await this.validationUpdateState('password', {cn: '请输入新密码', en: 'Please enter new password'}, false);
            } else if (!validatePassword(password)){
                await this.validationUpdateState('password', {
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

    async create (){
        let userData = Object.assign({}, this.state.userData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createLocalAuthUser(userData);
            httpRequests.getLocalAuthUserList();
            await this.hide();
            message.success(lang(`创建本地认证用户 ${userData.name} 成功!`, `Create local authentication user ${userData.name} successfully!`));
        } catch ({msg}){
            message.error(lang(`创建本地认证用户 ${userData.name} 失败, 原因: `, `Create local authentication user ${userData.name} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    showSelectPrimaryGroup (){
        this.selectLocalAuthUserGroupWrapper.getWrappedInstance().show(false);
    }

    showSelectSecondaryGroup (){
        this.selectLocalAuthUserGroupWrapper.getWrappedInstance().show(true);
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

    show (){
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            userData: {
                name: '',
                password: '',
                rePassword: '',
                primaryGroup: '',
                secondaryGroup: [],
                description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
                rePassword: {status: '', help: '', valid: false},
                password: {status: '', help: '', valid: false},
                primaryGroup: {status: '', help: '', valid: false},
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0, placement: 'right'};
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 4 : 8},
                sm: {span: isChinese ? 4 : 8},
            },
            wrapperCol: {
                xs: {span: isChinese ? 20 : 16},
                sm: {span: isChinese ? 20 : 16},
            }
        };
        return (
            <Modal
                title={lang('创建本地认证用户', 'Create Local Authentication User')}
                width={400}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('用户名', 'Username')}
                        validateStatus={this.state.validation.name.status}
                        help={this.state.validation.name.help}
                    >
                        <Input
                            style={{width: isChinese ? 290 : 230}} size="small"
                            placeholder={lang('请输入与用户名', 'Please enter the username')}
                            value={this.state.userData.name}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'name', value)();
                                this.validateForm.bind(this, 'name')();
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('密码', 'Password')}
                        validateStatus={this.state.validation.password.status}
                        help={this.state.validation.password.help}
                    >
                        <Input
                            style={{width: isChinese ? 290 : 230}} size="small"
                            type="password"
                            placeholder={lang('请输入密码', 'Please enter the password')}
                            value={this.state.userData.password}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'password', value)();
                                this.validateForm.bind(this, 'password')();
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('确认密码', 'Confirm')}
                        validateStatus={this.state.validation.rePassword.status}
                        help={this.state.validation.rePassword.help}
                    >
                        <Input
                            style={{width: isChinese ? 290 : 230}} size="small"
                            type="password"
                            placeholder={lang('请再次输入密码', 'Please enter password again')}
                            value={this.state.userData.rePassword}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'rePassword', value)();
                                this.validateForm.bind(this, 'rePassword')();
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('主组', 'Primary Group')}
                        validateStatus={this.state.validation.primaryGroup.status}
                        help={this.state.validation.primaryGroup.help}
                    >
                        <Input
                            style={{width: isChinese ? 255 : 195}} size="small"
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
                        <Popover
                            {...buttonPopoverConf}
                            content={lang(
                                '用户所属的主组，用于控制用户访问CIFS共享的权限。一个用户必须且只能属于某个特定的主组。',
                                'The primary group to which users belong controls the users\' permission for CIFS shares. A user must and can only belong to one primary group.'
                            )}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                        </Popover>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('附属组', 'Secondary Group')}>
                        <Input
                            style={{width: isChinese ? 255 : 195}} size="small"
                            readOnly
                            placeholder={lang('请选择附属组', 'Please select the secondary group')}
                            value={this.state.userData.secondaryGroup}
                            addonAfter={
                                <Icon
                                    type="usergroup-add"
                                    style={{cursor: 'pointer'}}
                                    onClick={this.showSelectSecondaryGroup.bind(this)}
                                />
                            }
                        />
                        <Popover
                            {...buttonPopoverConf}
                            content={lang(
                                '用户所属的附属组，用于控制用户访问CIFS共享的权限。一个用户可以属于多个附属组。',
                                'The secondary group to which users belong controls users\' permission for CIFS shares. A user can belong to multiple secondary groups.'
                            )}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                        </Popover>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 290 : 230}} size="small"
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
    let {language, main: {localAuthUser: {localAuthUserList}}} = state;
    return {language, localAuthUserList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateLocalAuthUser);