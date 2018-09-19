import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Divider, Form, Icon, InputNumber, message, Modal, Popover, Select, Switch} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class SecurityStrategySetting extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            strategyData: {
                // username strategy
                userNameMinLen: '',
                // password strategy
                passMinLen: '',
                passMaxLen: '',
                passComplexity: '',
                passRepeatCharMax: '',
                passAvailableDay: '',
                passChangeIntervalMinute: '',
            },
            validation: {
                // username strategy
                userNameMinLen: {status: '', help: '', valid: false},
                // password strategy
                passMinLen: {status: '', help: '', valid: false},
                passMaxLen: {status: '', help: '', valid: false},
                passComplexity: {status: '', help: '', valid: false},
                passRepeatCharMax: {status: '', help: '', valid: false},
                passAvailableDay: {status: '', help: '', valid: false},
                passChangeIntervalMinute: {status: '', help: '', valid: false},
            }
        };
    }

    formValueChange (key, value){
        let strategyData = Object.assign({}, this.state.strategyData, {[key]: value});
        this.setState({strategyData});
    }

    async validateForm (key){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
        await this.setState({validation});
        let {userNameMinLen, passMinLen, passMaxLen, passAvailableDay, passChangeIntervalMinute} = this.state.strategyData;
        if (key === 'userNameMinLen'){
            if (userNameMinLen.length < 3 || userNameMinLen.length > 31){
                // length allow 3-31
                await this.validationUpdateState('name', {
                    cn: '用户名最小长度允许设置为3-31位',
                    en: 'Minimum length of username allows to be set between 3-31'
                }, false);
            }
        }
        if (key === 'passMinLen'){
            if (passMinLen < 8 || passMinLen > 32){
                // length allow 8-32
                await this.validationUpdateState('passMinLen', {
                    cn: '密码最小长度允许设置为8-32',
                    en: 'Minimum length of password is allowed to be set between 8-32'
                }, false);
            }
            if (passMinLen > passMaxLen){
                // passMinLen can't be bigger than passMaxLen
                await this.validationUpdateState('passMinLen', {
                    cn: '密码最小长度的值不能大于密码最大长度的值',
                    en: 'Password\'s minimum length of  can\'t be bigger than its maximum length'
                }, false);
            }
        }
        if (key === 'passMaxLen'){
            if (passMaxLen < 8 || passMaxLen > 32){
                // length allow 8-32
                await this.validationUpdateState('passMaxLen', {
                    cn: '密码最大长度允许设置为8-32',
                    en: 'Maximum length of password is allowed to be set between 8-32'
                }, false);
            }
            if (passMinLen > passMaxLen){
                // passMinLen can't be bigger than passMaxLen
                await this.validationUpdateState('passMaxLen', {
                    cn: '密码最大长度的值不能小于密码最小长度的值',
                    en: 'Password\'s maximum length of  can\'t be less than its minimum length'
                }, false);
            }
        }

        if (key === 'passAvailableDay'){
            if (passAvailableDay < 1 || passAvailableDay > 999){
                // length allow 1-999
                await this.validationUpdateState('passAvailableDay', {
                    cn: '密码有效期允许设置为1-999天',
                    en: 'Password validate period is allowed to be set between 1-999 days'
                }, false);
            }
        }

        if (key === 'passChangeIntervalMinute'){
            if (passChangeIntervalMinute < 1 || passChangeIntervalMinute > 9999){
                // length allow 1-9999
                await this.validationUpdateState('passChangeIntervalMinute', {
                    cn: '密码有效期允许设置为1-999天',
                    en: 'Password change interval is allowed to be set between 1-9999 minutes'
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

    async setStrategy (){
        let strategyData = Object.assign({}, this.state.strategyData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateLocalAuthUserSecurityStrategySetting(strategyData);
            await this.hide();
            message.success(lang('安全策略设置成功!', 'Set security strategy successfully!'));
        } catch ({msg}){
            message.error(lang('安全策略设置失败, 原因: ', 'Set security strategy failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    async show (){
        this.setState({
            visible: true,
            formValid: true,
            formSubmitting: false,
            strategyData: {
                // username strategy
                userNameMinLen: '',
                // password strategy
                passMinLen: '',
                passMaxLen: '',
                passComplexity: '',
                passRepeatCharMax: '',
                passAvailableDay: '',
                passChangeIntervalMinute: '',
            },
            validation: {
                // username strategy
                userNameMinLen: {status: '', help: '', valid: true},
                // password strategy
                passMinLen: {status: '', help: '', valid: true},
                passMaxLen: {status: '', help: '', valid: true},
                passComplexity: {status: '', help: '', valid: true},
                passRepeatCharMax: {status: '', help: '', valid: true},
                passAvailableDay: {status: '', help: '', valid: true},
                passChangeIntervalMinute: {status: '', help: '', valid: true},
            }
        });
        this.setState({
            strategyData: (await httpRequests.getLocalAuthUserSecurityStrategySetting())
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 7 : 8},
                sm: {span: isChinese ? 7 : 8},
            },
            wrapperCol: {
                xs: {span: isChinese ? 17 : 16},
                sm: {span: isChinese ? 17 : 16},
            }
        };
        return (
             <Modal
                title={lang('安全策略设置', 'Security Strategy Setting')}
                width={480}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            type="primary"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.setStrategy.bind(this)}
                        >
                            {lang('保存', 'Create')}
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
                    <Divider dashed style={{marginTop: 0}} orientation="left">{lang('用户名策略', 'Username Strategy')}</Divider>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('最小长度', 'Minimum Length')}
                        validateStatus={this.state.validation.userNameMinLen.status}
                        help={this.state.validation.userNameMinLen.help}
                    >
                        <InputNumber
                            size="small"
                            style={{width: isChinese ? 80 : 80, marginRight: 10}}
                            min={3}
                            max={31}
                            value={this.state.strategyData.userNameMinLen}
                            onChange={value => {
                                this.formValueChange.bind(this, 'userNameMinLen', value)();
                                this.validateForm.bind(this, 'userNameMinLen')();
                            }}
                        />
                        3-31
                    </Form.Item>
                    <Divider dashed orientation="left">{lang('密码策略', 'Password Strategy')}</Divider>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('最小长度', 'Minimum Length')}
                        validateStatus={this.state.validation.passMinLen.status}
                        help={this.state.validation.passMinLen.help}
                    >
                        <InputNumber
                            size="small"
                            style={{width: isChinese ? 80 : 80, marginRight: 10}}
                            min={8}
                            max={32}
                            value={this.state.strategyData.passMinLen}
                            onChange={value => {
                                this.formValueChange.bind(this, 'passMinLen', value)();
                                this.validateForm.bind(this, 'passMinLen')();
                            }}
                        />
                        8-32
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('最大长度', 'Maximum Length')}
                        validateStatus={this.state.validation.passMaxLen.status}
                        help={this.state.validation.passMaxLen.help}
                    >
                        <InputNumber
                            size="small"
                            style={{width: isChinese ? 80 : 80, marginRight: 10}}
                            min={8}
                            max={32}
                            value={this.state.strategyData.passMaxLen}
                            onChange={value => {
                                this.formValueChange.bind(this, 'passMaxLen', value)();
                                this.validateForm.bind(this, 'passMaxLen')();
                            }}
                        />
                        8-32
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('复杂度', 'Complexity')}
                        validateStatus={this.state.validation.passComplexity.status}
                        help={this.state.validation.passComplexity.help}
                    >
                        <Select
                            size="small"
                            value={this.state.strategyData.passComplexity}
                            onChange={value => {
                                this.formValueChange.bind(this, 'passComplexity')(value);
                            }}
                        >
                            <Select.Option value={3}>
                                <Popover
                                    placement="right"
                                    content={lang('必须包含特殊字符，并且至少包含大写字母、小写字母以及数字中的两种组合', 'Must contain special characters and any two types of uppercase letters, lowercase letters, and digits')}
                                >
                                    {lang('必须包含特殊字符，并且至少包含大写字母、小写字母以及数字中的两种组合', 'Must contain special characters and any two types of uppercase letters, lowercase letters, and digits')}
                                </Popover>
                            </Select.Option>
                            <Select.Option value={4}>
                                <Popover
                                    placement="right"
                                    content={lang('必须包含特殊字符、大写字母、小写字母和数字', 'Must contain special characters, uppercase letters, lowercase letters, and digits')}
                                >
                                    {lang('必须包含特殊字符、大写字母、小写字母和数字', 'Must contain special characters, uppercase letters, lowercase letters, and digits')}</Popover>
                            </Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('字符重复次数', 'Duplicated Chars')}
                        validateStatus={this.state.validation.passRepeatCharMax.status}
                        help={this.state.validation.passRepeatCharMax.help}
                    >
                        <Select
                            style={{width: isChinese ? 100 : 100}}
                            size="small"
                            value={this.state.strategyData.passRepeatCharMax}
                            onChange={value => {
                                this.formValueChange.bind(this, 'passRepeatCharMax')(value);
                            }}
                        >
                            <Select.Option key={99999} value={99999}>{lang('不限制', 'Unlimited')}</Select.Option>
                            {Object.keys(Array.apply(null, {length: 9})).map((val, i) => (
                                <Select.Option key={i + 1} value={i + 1}>{i + 1}</Select.Option>
                            ))}
                        </Select>
                        <Popover
                            placement="right"
                            content={lang('某字符连续出现的次数', 'Number of consecutive occurrences of a char')}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-l" />
                        </Popover>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('密码有效期', 'Password Validity Period')}
                        validateStatus={this.state.validation.passAvailableDay.status}
                        help={this.state.validation.passAvailableDay.help}
                    >
                        <Switch
                            style={{marginRight: 10}} size="small"
                            checked={this.state.strategyData.passAvailableDay !== 99999}
                            onChange={checked => this.formValueChange.bind(this, 'passAvailableDay')(checked ? 30 : 99999)}
                        />
                        {
                            this.state.strategyData.passAvailableDay !== 99999 && <React.Fragment>
                                <InputNumber
                                    size="small"
                                    style={{width: isChinese ? 80 : 80, marginRight: 10}}
                                    min={1}
                                    max={999}
                                    value={this.state.strategyData.passAvailableDay}
                                    onChange={value => {
                                        this.formValueChange.bind(this, 'passAvailableDay', value)();
                                        this.validateForm.bind(this, 'passAvailableDay')();
                                    }}
                                />
                                1-999 {lang('天', 'Day(s)')}
                            </React.Fragment>
                        }
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('密码修改间隔时间', 'Password Change Interval')}
                        validateStatus={this.state.validation.passChangeIntervalMinute.status}
                        help={this.state.validation.passChangeIntervalMinute.help}
                    >
                        <Switch
                            style={{marginRight: 10}} size="small"
                            checked={this.state.strategyData.passChangeIntervalMinute !== 99999}
                            onChange={checked => this.formValueChange.bind(this, 'passChangeIntervalMinute')(checked ? 2 : 99999)}
                        />
                        {
                            this.state.strategyData.passChangeIntervalMinute !== 99999 && <React.Fragment>
                                <InputNumber
                                    size="small"
                                    style={{width: isChinese ? 80 : 80, marginRight: 10}}
                                    min={1}
                                    max={9999}
                                    value={this.state.strategyData.passChangeIntervalMinute}
                                    onChange={value => {
                                        this.formValueChange.bind(this, 'passChangeIntervalMinute', value)();
                                        this.validateForm.bind(this, 'passChangeIntervalMinute')();
                                    }}
                                />
                                1-9999 {lang('分钟', 'Minute(s)')}
                            </React.Fragment>
                        }
                    </Form.Item>
                </Form>
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SecurityStrategySetting);