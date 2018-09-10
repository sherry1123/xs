import React, {Component} from 'react';
import {connect} from 'react-redux';
import update from 'react-addons-update';
import {Button, Checkbox, Col, Form, Icon, Input, message, Modal, Row, Popover, Select, Switch} from 'antd';
import lang from 'Components/Language/lang';
import {validateNotZeroInteger, validateFsName, timeUnitMilliSecond} from 'Services';
import httpRequests from 'Http/requests';

class CreateSnapshotSchedule extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            scheduleData: {
                name: '',
                interval: '', intervalNumber: '', intervalUnit: 'Hour',
                deleteRound: false,
                autoDisable: false,
                autoDisableTime: '', autoDisableTimeNumber: 5, autoDisableTimeUnit: 'Day',
                description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
                interval: {status: '', help: '', valid: false},
                autoDisableTime: {status: '', help: '', valid: false}
            },
        };
    }

    async numberInputLengthCut (key, allowLength){
        if (!validateNotZeroInteger(this.state.scheduleData[key])){
            // can't be started with 0
            let scheduleData = Object.assign({}, this.state.scheduleData);
            scheduleData[key] = null;
            let newState = update(this.state, {scheduleData: {$set: scheduleData}});
            await this.setState(Object.assign(this.state, newState));
        } else {
            let numberStr = this.state.scheduleData[key].toString();
            // default maximum to 999, 3 digit number
            allowLength = allowLength || 3;
            if (numberStr.length > allowLength){
                let scheduleData = Object.assign({}, this.state.scheduleData);
                scheduleData[key] = Number(numberStr.slice(0, allowLength));
                let newState = update(this.state, {scheduleData: {$set: scheduleData}});
                await this.setState(Object.assign(this.state, newState));
            }
        }
    }

    formValueChange (key, value, target = 'scheduleData'){
        let newScheduleData = Object.assign({}, this.state[target]);
        if (key === 'intervalNumber'){
            if (!validateNotZeroInteger(value)){
                value = value.length > 0 ? this.state.scheduleData.intervalNumber : '';
            }
        }
        newScheduleData[key] = value;
        let newState = update(this.state, {scheduleData: {$set: newScheduleData}});
        this.setState(Object.assign(this.state, newState));
        // console.info(this.state.scheduleData);
    }

    async validationUpdateState (key, value, valid){
        let obj = {validation: {}};
        obj.validation[key] = {
            status: {$set: (value.cn || value.en) ? 'error' : ''},
            help: {$set: lang(value.cn, value.en)},
            valid: {$set: valid}
        };
        let newState = update(this.state, obj);
        await this.setState(Object.assign(this.state, newState));
    }

    async validateForm (key){
        // reset current form field validation
        let validation = Object.assign({}, this.state.validation);
        validation[key] = {status: '', help: '', valid: true};
        let newState = update(this.state, {
            formValid: {$set: false},
            validation: {$set: validation}
        });
        await this.setState(Object.assign(this.state, newState));

        if (key === 'name'){
            // validate schedule name
            if (!validateFsName(this.state.scheduleData.name)){
                this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度3-30位',
                    en: 'name can only contains letter, number and underscore(except for the first place), length is 3-30'
                }, false);
            }
            // validate schedule name duplication
            let isScheduleNameDuplicated = this.props.snapshotScheduleList.some(schedule => schedule.name === this.state.scheduleData.name);
            if (isScheduleNameDuplicated){
                this.validationUpdateState('name', {cn: '名称已经存在', en: 'The name already existed'}, false);
            }
        } else if (key === 'interval'){
            if (!this.state.scheduleData.intervalNumber){
                this.validationUpdateState('interval', {cn: '请输入正整数', en: 'please enter a positive integer'}, false);
            }
        }

        if (this.state.scheduleData.autoDisable){
            // if enable delay disable schedule automatically
            if (!this.state.scheduleData.autoDisableTimeNumber){
                this.validationUpdateState('autoDisableTime', {cn: '请输入延时关闭时间', en: 'please enter delay disable time'}, false);
            }
        } else {
            this.validationUpdateState('autoDisableTime', {cn: '', en: ''}, true);
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async createSnapshotSchedule (){
        let schedule = Object.assign({}, this.state.scheduleData);
        schedule.interval = timeUnitMilliSecond[schedule.intervalUnit] * schedule.intervalNumber;
        schedule.autoDisableTime = timeUnitMilliSecond[schedule.autoDisableTimeUnit] * schedule.autoDisableTimeNumber;
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createSnapshotSchedule(schedule);
            httpRequests.getSnapshotScheduleList();
            await this.hide();
            message.success(lang(`定时快照任务 ${schedule.name} 创建成功！要启用此计划请先执行它。`, `Create snapshot schedule ${schedule.name} successfully! If you want to running this schedule, need to execute it.`));
        } catch (e){
            message.error(lang(`定时快照任务 ${schedule.name} 创建失败！`, `Create snapshot schedule ${schedule.name} failed!`));
        }
        this.setState({formSubmitting: false});
    }

    show (){
        this.setState({
            visible: true,
            formSubmitting: false,
            scheduleData: {
                name: '',
                interval: '', intervalNumber: '', intervalUnit: 'Hour',
                deleteRound: false,
                autoDisable: false,
                autoDisableTime: '', autoDisableTimeNumber: 5, autoDisableTimeUnit: 'Day',
                description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
                interval: {status: '', help: '', valid: false},
                autoDisableTime: {status: '', help: '', valid: false},
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render () {
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 5 : 7},
                sm: {span: isChinese ? 5 : 7},
            },
            wrapperCol: {
                xs: {span: isChinese ? 19 : 17},
                sm: {span: isChinese ? 19 : 17},
            }
        };

        return (
            <Modal title={lang('创建定时快照计划', 'Create Timed Snapshot Schedule')}
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
                            size="small" type="primary"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.createSnapshotSchedule.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('名称', 'Name')}
                        validateStatus={this.state.validation.name.status}
                        help={this.state.validation.name.help}
                    >
                        <Input
                            size="small"
                            value={this.state.scheduleData.name}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'name')(value);
                                this.validateForm.bind(this)('name');
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('间隔时间', 'Interval')}
                        validateStatus={this.state.validation.interval.status}
                        help={this.state.validation.interval.help}
                    >
                        <Row style={{height: 32}}>
                            <Col span={6}>
                                <Form.Item validateStatus={this.state.validation.interval.status}>
                                    <Input
                                        type="text" size="small"
                                        value={this.state.scheduleData.intervalNumber}
                                        onChange={({target: {value}}) => {
                                            this.formValueChange.bind(this, 'intervalNumber')(value);
                                            this.numberInputLengthCut.bind(this, 'intervalNumber', 3)();
                                            this.validateForm.bind(this)('interval');
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={1}>
                                <p className="ant-form-split"></p>
                            </Col>
                            <Col span={4}>
                                <Form.Item>
                                    <Select style={{width: 80}} size="small"
                                        value={this.state.scheduleData.intervalUnit}
                                        onChange={value => {
                                            this.formValueChange.bind(this, 'intervalUnit')(value);
                                            this.validateForm.bind(this)('interval');
                                        }}
                                    >
                                        {/*<Select.Option value="Week">{lang('周', 'Week')}</Select.Option>
                                            <Select.Option value="Day">{lang('天', 'Day')}</Select.Option>*/}
                                        <Select.Option value="Hour">{lang('小时', 'Hour')}</Select.Option>
                                        {process.env.NODE_ENV === 'development' &&
                                        <Select.Option value="Minute">{lang('分钟', 'Minute')}</Select.Option>}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('循环删除', 'Loop Delete')}>
                        <Switch
                            style={{marginRight: 10}} size="small"
                            checked={this.state.scheduleData.deleteRound}
                            onChange={checked => this.formValueChange.bind(this, 'deleteRound')(checked)}
                        />
                        {this.state.scheduleData.deleteRound ? lang('启用', 'Enable') : lang('不启用', 'Enable')}
                        <Popover
                            placement="right"
                            content={lang(
                                '一旦启用，当快照数量达到限制后自动删除创建时间最早的定时快照',
                                'Once enabled, will delete the earliest timed snapshot automatically once their count reach the limitation.'
                            )}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                        </Popover>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('延时关闭', 'Delay Disable')}
                        validateStatus={this.state.validation.autoDisableTime.status}
                        help={this.state.validation.autoDisableTime.help}
                    >
                        <Input
                            style={{width: isChinese ? 170 : 140}} type="text" size="small"
                            disabled={!this.state.scheduleData.autoDisable}
                            addonAfter={lang('天后', 'Day(s) Later')}
                            value={this.state.scheduleData.autoDisableTimeNumber}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'autoDisableTimeNumber')(value);
                                this.numberInputLengthCut.bind(this, 'autoDisableTimeNumber', 3)();
                                this.validateForm.bind(this)('autoDisableTime');
                            }}
                        />
                        <Checkbox
                            style={{marginLeft: 20}}
                            checked={!this.state.scheduleData.autoDisable}
                            onChange={({target: {checked}}) => {
                                this.formValueChange.bind(this, 'autoDisable')(!checked);
                                this.validateForm.bind(this)('autoDisableTime');
                            }}
                        />
                        {lang(' 永不', '  Never')}
                        <Popover
                            placement="right"
                            content={lang('延时关闭时间从执行该计划时开始计算', 'Delay disable time is calculated since execute this schedule.')}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-l" />
                        </Popover>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            placeholder={lang('描述为选填项', 'description is optional')}
                            value={this.state.scheduleData.description}
                            maxLength={255}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'description')(value);
                                this.validateForm.bind(this)('description');
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {snapshot: {snapshotScheduleList}}} = state;
    return {language, snapshotScheduleList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateSnapshotSchedule);