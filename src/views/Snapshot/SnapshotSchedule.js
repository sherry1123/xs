import React, {Component} from "react";
import {connect} from "react-redux";
import update from "react-addons-update";
import {Button, Col, /*DatePicker,*/ Form, Icon, Input, message, Modal, Popover, Row, Select, Switch, Table} from "antd";
import lang from "../../components/Language/lang";
// import moment from 'moment';
import {timeLeftFormat, timeFormat, validateNotZeroInteger, validateFsName, timeUnitMilliSecond} from "../../services";
import httpRequests from '../../http/requests';

class SnapshotSchedule extends Component {
    constructor (props){
        super(props);
        let {snapshotScheduleList} = this.props;
        this.state = {
            // list
            query: '',
            snapshotScheduleList,
            snapshotScheduleListBackup: snapshotScheduleList,
            // create form
            visible: false,
            formValid: false,
            formSubmitting: false,
            scheduleData: {
                name: '',
                // startTime: moment(new Date(new Date().getTime() + 3 * 60 * 1000)),
                interval: '', intervalNumber: '', intervalUnit: 'Hour',
                deleteRound: false,
                autoDisable: false,
                autoDisableTime: '', autoDisableTimeNumber: '', autoDisableTimeUnit: 'Day',
            },
            validation: {
                name: {status: '', help: '', valid: false},
                // startTime: {status: '', help: '', valid: true},
                interval: {status: '', help: '', valid: false},
                autoDisableTime: {status: '', help: '', valid: false}
            },
        };
    }

    componentDidMount (){
        httpRequests.getSnapshotScheduleList();
    }

    async componentWillReceiveProps (nextProps){
        let {snapshotScheduleList} = nextProps;
        await this.setState({
            snapshotScheduleList,
            snapshotScheduleListBackup: snapshotScheduleList
        });
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value}}){
        this.setState({query: value});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            let snapshotScheduleList = Object.assign([], this.state.snapshotScheduleListBackup);
            let newSnapshotScheduleList = snapshotScheduleList.filter(({name = ''}) => name.match(query));
            await this.setState({query, snapshotScheduleList: newSnapshotScheduleList});
        } else {
            this.setState({snapshotScheduleList: this.state.snapshotScheduleListBackup});
        }
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
                scheduleData[key] = parseInt(numberStr.slice(0, allowLength), 0);
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
        if (key === 'autoDisable'){
            newScheduleData.autoDisableTimeNumber = '';
        }
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
                this.validationUpdateState('autoDisableTime', {cn: '请输入自动延时关闭时间', en: 'please enter delay disable automatically time'}, false);
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
        console.info(schedule.autoDisableTimeUnit, schedule.autoDisableTimeNumber);
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

    deleteSchedule (schedule, index){
        Modal.confirm({
            title: lang(`确定删除这个定时快照任务 ${schedule.name} 吗?`, `Are you sure you want to delete this snapshot schedule ${schedule.name} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteSnapshotSchedule(schedule);
                    let snapshotScheduleList = Object.assign([], this.state.snapshotScheduleList);
                    snapshotScheduleList.splice(index, 1);
                    this.setState({snapshotScheduleList});
                    message.success(lang(`定时快照任务 ${schedule.name} 删除成功!`, `Delete snapshot schedule ${schedule.name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除定时快照任务 ${schedule.name} 失败, 原因: `, `Delete snapshot schedule ${schedule.name} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    async scheduleStatusSwitch (snapshotSchedule, index, checked){
        if (checked){
            let isRunningOne = this.props.snapshotScheduleList.some(schedule => schedule.isRunning);
            if (isRunningOne){
                message.warning(lang('已经有一个定时快照计划在执行了，请先关闭它！', 'Already a timed snapshot schedule is running now, please firstly disable it.'));
            } else {
                try {
                    await httpRequests.enableSnapshotSchedule(snapshotSchedule);
                    let snapshotScheduleList = Object.assign([], this.state.snapshotScheduleList);
                    let schedule = snapshotScheduleList[index];
                    schedule.isRunning = true;
                    snapshotScheduleList.splice(index, 1, schedule);
                    this.setState({snapshotScheduleList});
                } catch (e){
                    message.error(lang(`启用定时快照计划 ${snapshotSchedule.name} 失败！`, `Enable timed snapshot schedule ${snapshotSchedule.name} failed!`));
                }
            }
        } else {
            try {
                await httpRequests.disableSnapshotSchedule(snapshotSchedule);
                let snapshotScheduleList = Object.assign([], this.state.snapshotScheduleList);
                let schedule = snapshotScheduleList[index];
                schedule.isRunning = false;
                snapshotScheduleList.splice(index, 1, schedule);
                this.setState({snapshotScheduleList});
            } catch (e){
                message.error(lang(`关闭定时快照计划 ${snapshotSchedule.name} 失败！`, `Disable timed snapshot schedule ${snapshotSchedule.name} failed!`));
            }
        }
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
                autoDisableTime: '', autoDisableTimeNumber: '', autoDisableTimeUnit: 'Day',
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

    render (){
        let tableProps = {
            dataSource: this.state.snapshotScheduleList,
            pagination: true,
            locale: {
                emptyText: lang('暂无定时快照', 'No Snapshot Schedule')
            },
            rowKey: '_id',
            columns: [{
                title: lang('名称', 'Name'),
                dataIndex: 'name',
                render: text => text
            }, {
                title: lang('自动删除', 'Automatically Delete'),
                dataIndex: 'deleteRound',
                render: text => text ? lang('是', 'Yes') : lang('否', 'No')
            }, {
                title: lang('开始时间', 'Start Time'),
                dataIndex: 'startTime',
                render: (text, record) => record.isRunning ? timeFormat(text) : '--'
            }, {
                title: lang('间隔时间', 'Interval Time'),
                dataIndex: 'interval',
                render: text => timeLeftFormat(text)
            }, {
                title: lang('自动延时关闭时间', 'Auto Delay Disable Time'),
                dataIndex: 'autoDisableTime',
                render: text => text !== 0 ? timeLeftFormat(text) : '--'
            }, {
                title: lang('创建时间', 'Create Time'),
                dataIndex: 'createTime',
                render: text => timeFormat(text)
            }, {
                title: lang('操作', 'Operations'),
                width: 120,
                render: (text, record, index) => <div>
                    <Switch size="small" style={{marginTop: -6}}
                        title={record.isRunning ? lang('关闭', 'Disable') : lang('执行', 'Execute')}
                        checked={record.isRunning}
                        onChange={this.scheduleStatusSwitch.bind(this, record, index)}
                    />
                    <a onClick={this.deleteSchedule.bind(this, record, index)} title={lang('删除', 'delete')}
                       style={{marginLeft: 10}}
                    >
                        <Icon style={{fontSize: 15}} type="delete" />
                    </a>
                </div>

            }],
        };
        return (
            <div className="fs-page-content fs-snapshot-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('定时快照计划', 'Timed Snapshot Schedule')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <div className="fs-snapshot-operation-wrapper">
                            <Input.Search style={{marginRight: 15, width: 150}} size="small"
                                placeholder={lang('定时快照名称', 'Snapshot schedule name')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button className="fs-create-snapshot-button"
                                size="small"
                                onClick={this.show.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                    </section>
                </section>
                <Modal title={lang('创建定时快照计划', 'Create Timed Snapshot Schedule')}
                       width={360}
                       closable={false}
                       maskClosable={false}
                       visible={this.state.visible}
                       afterClose={this.close}
                       footer={
                           <div>
                               <Button size="small" type="primary" disabled={!this.state.formValid}
                                   loading={this.state.formSubmitting}
                                   onClick={this.createSnapshotSchedule.bind(this)}
                               >
                                   {lang('创建', 'Create')}
                               </Button>
                               <Button size="small" onClick={this.hide.bind(this)}>
                                   {lang('取消', 'Cancel')}
                               </Button>
                           </div>
                       }
                >
                    <Form layout="vertical">
                        <Form.Item label={lang('计划名称', 'Schedule Name')}
                            validateStatus={this.state.validation.name.status}
                            help={this.state.validation.name.help}
                        >
                            <Input style={{width: 240}} size="small"
                                   value={this.state.scheduleData.name}
                                   onChange={({target: {value}}) => {
                                       this.formValueChange.bind(this, 'name')(value);
                                       this.validateForm.bind(this)('name');
                                   }}
                            />
                        </Form.Item>
                        {/*
                        <Form.Item label={lang('开始时间', 'Start Time')}
                           validateStatus={this.state.validation.startTime.status}
                           help={this.state.validation.startTime.help}
                        >
                            <DatePicker size="small" format="YYYY-MM-DD HH:mm"
                                placeholder={lang('请选择开始时间', 'please select start time')}
                                value={this.state.scheduleData.startTime}
                                disabledDate={current => current && current.valueOf() < Date.now()}
                                allowClear={false}
                                showTime={{format: 'HH:mm'}}
                                onChange={momentDate => {
                                    this.formValueChange.bind(this, 'startTime')(momentDate);
                                }}
                            />
                        </Form.Item>
                        */}
                        <Form.Item label={lang('间隔时间', 'Interval Time')}
                           validateStatus={this.state.validation.interval.status}
                           help={this.state.validation.interval.help}
                        >
                            <Row style={{height: 32}}>
                                <Col span={6}>
                                    <Form.Item validateStatus={this.state.validation.interval.status}>
                                        <Input type="text" size="small"
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
                                    <p className="ant-form-split"> </p>
                                </Col>
                                <Col span={4}>
                                    <Form.Item>
                                        <Select style={{width: 100}} size="small"
                                            value={this.state.scheduleData.intervalUnit}
                                            onChange={value => {
                                                this.formValueChange.bind(this, 'intervalUnit')(value);
                                                this.validateForm.bind(this)('interval');
                                            }}
                                        >
                                            {/*<Select.Option value="Week">{lang('周', 'Week')}</Select.Option>
                                            <Select.Option value="Day">{lang('天', 'Day')}</Select.Option>*/}
                                            <Select.Option value="Hour">{lang('小时', 'Hour')}</Select.Option>
                                            {process.env.NODE_ENV === 'development' && <Select.Option value="Minute">{lang('分钟', 'Minute')}</Select.Option>}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item>
                            {lang('自动删除快照', 'Auto Delete Snapshot')}
                            <Switch style={{marginLeft: 10}} size="small"
                                checked={this.state.scheduleData.deleteRound}
                                onChange={checked => {
                                    this.formValueChange.bind(this, 'deleteRound')(checked);
                                }}
                            />
                            <Popover placement="right"
                                content={lang(
                                    '快照数量达到限制后自动删除创建时间最早的定时快照',
                                    'Delete the earliest timed snapshot automatically once their count reach the limitation.'
                                )}
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                            </Popover>
                        </Form.Item>
                        <Form.Item>
                            {lang('自动延时关闭计划', 'Auto Delay Disable Schedule')}
                            <Switch style={{marginLeft: 10}} size="small"
                                checked={this.state.scheduleData.autoDisable}
                                onChange={checked => {
                                    this.formValueChange.bind(this, 'autoDisable')(checked);
                                    this.validateForm.bind(this)('autoDisableTime');
                                }}
                            />
                            <Popover placement="right"
                                 content={lang(
                                     '从开始时间算起到达该时间点后，会自动关闭该定时快照计划',
                                     'If it times from start time and then reaches this time, will disable this schedule automatically.'
                                 )}
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                            </Popover>
                        </Form.Item>
                        {
                            this.state.scheduleData.autoDisable &&
                            <Form.Item label={lang('延时关闭时间', 'Delay Disable Time')}
                                validateStatus={this.state.validation.autoDisableTime.status}
                                help={this.state.validation.autoDisableTime.help}
                            >
                                <Row style={{height: 32}}>
                                    <Col span={6}>
                                        <Form.Item validateStatus={this.state.validation.autoDisableTime.status}>
                                            <Input type="text" size="small"
                                                   value={this.state.scheduleData.autoDisableTimeNumber}
                                                   onChange={({target: {value}}) => {
                                                       this.formValueChange.bind(this, 'autoDisableTimeNumber')(value);
                                                       this.numberInputLengthCut.bind(this, 'autoDisableTimeNumber', 3)();
                                                       this.validateForm.bind(this)('autoDisableTime');
                                                   }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={1}>
                                        <p className="ant-form-split"> </p>
                                    </Col>
                                    <Col span={4}>
                                        {lang('天', 'Day(s)')}
                                    </Col>
                                </Row>
                            </Form.Item>
                        }
                    </Form>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {snapshot: {snapshotScheduleList}}} = state;
    return {language, snapshotScheduleList};
};

export default connect(mapStateToProps)(SnapshotSchedule);