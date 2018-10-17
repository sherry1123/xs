import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Popover} from 'antd';
import SelectLocalAuthUserGroup from './SelectLocalAuthUserGroup';
import lang from 'Components/Language/lang';
import {debounce, validationUpdateState} from 'Services';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language, main: {localAuthUser: {localAuthUserList}}} = state;
    return {language, localAuthUserList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
@validationUpdateState(lang)
export default class CreateLocalAuthUser extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            strategyData: {},
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

    validateUsername (name){
        let {userNameMinLen} = this.state.strategyData;
        return /^[a-zA-Z0-9_]*$/.test(name) && name.length >= userNameMinLen;
    }

    validateUsernameCharDuplication (name, times){
        // if times is 99999 means there's no limitation
        if (times === 99999){
            return true;
        }
        let CHAR_DUPLICATION_REG = /(.)\1*/g;
        let matchRes = name.match(CHAR_DUPLICATION_REG);
        if (!matchRes){
            return true;
        } else {
            return matchRes.reduce((prev, current) => prev && !(current.length > times), true);
        }
    }

    validatePassword (password){
        // validate invalid value like: null, undefined, NaN, empty string
        if (!password){
            return false;
        }
        let {passMinLen, passMaxLen, passComplexity, passRepeatCharMax} = this.state.strategyData;
        // validate complexity
        const SPECIAL_EN_CHAR_REG = /[`~!@#$%^&*()_\\\-+=|<>?:"{},.'/;[\]]/im;
        // const SPECIAL_CN_CHAR_REG = /[·！#￥（——）：；“”‘、，|《。》？、【】]/im;
        const UPPERCASE_LETTER_REG = /[A-Z]/;
        const LOWERCASE_LETTER_REG = /[a-z]/;
        const DIGIT_REG = /[\d]/; // /[0-9]/
        // must contain special characters whether passComplexity is 3 or 4
        // only validate english special chars temporarily
        if (!SPECIAL_EN_CHAR_REG.test(password)/* && !SPECIAL_CN_CHAR_REG.test(password)*/){
            return false;
        }
        if (passComplexity === 3){
            // if passComplexity is 3, still needs contains any two types of uppercase letters, lowercase letters, and digits
            if (UPPERCASE_LETTER_REG.test(password) + LOWERCASE_LETTER_REG.test(password) + DIGIT_REG.test(password) < 2){
                return false;
            }
        } else {
            // if passComplexity is 4, still needs contains uppercase letters, lowercase letters, and digits
            if (UPPERCASE_LETTER_REG.test(password) + LOWERCASE_LETTER_REG.test(password) + DIGIT_REG.test(password) < 3){
                return false;
            }
        }
        // validate char duplication
        if (!this.validateUsernameCharDuplication(password, passRepeatCharMax)){
            return false;
        }
        // validate length
        return password.length >= passMinLen && password.length <= passMaxLen;
    }

    @debounce(500)
    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {name, password, rePassword, primaryGroup} = this.state.userData;
        if (key === 'name'){
            if (!name){
                this.validationUpdateState('name', {cn: '请输入用户姓名', en: 'Please enter username'}, false);
            } else if (!this.validateUsername(name)){
                this.validationUpdateState('name', {
                    cn: `安全策略要求用户名仅能以字母、数字以或划线开头，长度不少于${this.state.strategyData.userNameMinLen}位`,
                    en: `The security strategy only allow username starts with a letter, number or underscore, length can't be less than ${this.state.strategyData.userNameMinLen}`
                }, false);
            }
            let isNameDuplicated = this.props.localAuthUserList.some(user => user.name === name);
            if (isNameDuplicated){
                this.validationUpdateState('name', {
                    cn: '该用户名已被使用',
                    en: 'This username has already been used'
                }, false);
            }
        }
        if (key === 'password'){
            if (!password){
                await this.validationUpdateState('password', {cn: '请输入新密码', en: 'Please enter new password'}, false);
            } else if (!this.validatePassword(password)){
                let specialChars = `\`~!@#$%^&*()_\\-+=|<>?:"}{,.'/;][`;
                let {passMinLen, passMaxLen, passComplexity, passRepeatCharMax} = this.state.strategyData;
                let complexityTip = {
                    cn: passComplexity === 3 ? '还需包含小写、大写字母、数字的至少2种组合，' : '还必须包含小写、大写字母和数字，',
                    en: passComplexity === 3 ? 'still needs contains any two types of uppercase letters, lowercase letters, and digits,' : 'still needs contains uppercase letters, lowercase letters, and digits,'
                };
                let duplicationTip = {
                    cn: passRepeatCharMax === 99999 ? '' : `字符连续重复次数不能超过${passRepeatCharMax}次，`,
                    en: passRepeatCharMax === 99999 ? '' : `number of characters can‘t be duplicated more than ${passRepeatCharMax} times,`
                };
                await this.validationUpdateState('password', {
                    cn: `安全策略要求密码包含特殊字符例如: ${specialChars}，${complexityTip.cn} ${duplicationTip.cn} 长度为${passMinLen}-${passMaxLen}位`,
                    en: `Security strategy requires to contain special chars like: ${specialChars}, ${complexityTip.en} ${duplicationTip.cn} length is ${passMinLen}-${passMaxLen}`
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
        // console.info(type, groupNames);
        if (type === 'primaryGroup'){
            groupNames = groupNames[0];
        }
        this.formValueChange(type, groupNames);
        if (type === 'primaryGroup'){
            this.validateForm(type);
        }
    }

    async show (){
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            strategyData: {},
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
        this.setState({strategyData: await httpRequests.getLocalAuthUserSecurityStrategySetting()});
    }

    hide (){
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
                title={
                    <span>
                        {lang('创建本地认证用户', 'Create Local Authentication User')}
                        {!this.state.strategyData.hasOwnProperty('userNameMinLen') &&
                            <Popover
                                {...buttonPopoverConf}
                                content={lang('加载安全策略中...', 'Loading security strategy...')}
                            >
                                <Icon type="loading" style={{marginLeft: 10}} />
                            </Popover>
                        }
                    </span>
                }
                width={420}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            disabled={this.state.formSubmitting}
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
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
                            placeholder={lang('描述为选填项，长度为0-200', 'Description is optional, length is 0-200')}
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