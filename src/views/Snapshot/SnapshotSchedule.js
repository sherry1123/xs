import React, {Component} from "react";
import {connect} from "react-redux";
import update from "react-addons-update";
import {Button, Col, DatePicker, Form, Icon, Input, message, Modal, Row, Select, Switch, Table, Tooltip} from "antd";
import lang from "../../components/Language/lang";
import moment from 'moment';
import {timeLeftFormat, timeFormat, validateNotZeroInteger, validateFsName, TIME_UNIT_MILLISECOND_MAP} from "../../services";
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
            scheduleData: {
                name: '',
                startTime: moment(new Date(new Date().getTime() + 3 * 60 * 1000)),
                interval: '', intervalNumber: '', intervalUnit: 'Hour',
                deleteRound: false
            },
            validation: {
                name: {status: '', help: '', valid: false},
                startTime: {status: '', help: '', valid: true},
                interval: {status: '', help: '', valid: false}
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
            let newSnapshotScheduleList = snapshotScheduleList.filter(({name}) => name.match(query));
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

    intervalChange (key, value){
        let intervalNumber = 0;
        let intervalUnit = 0;
        if (key === 'intervalNumber'){
            if (!validateNotZeroInteger(value)){
                // only sizeNumber input may receive a non positive integer text
                value = value.length > 0 ? this.state.scheduleData.intervalNumber : '';
            }
            intervalNumber = value;
            intervalUnit = this.state.scheduleData.intervalUnit;
        } else {
            intervalNumber = this.state.scheduleData.intervalNumber;
            intervalUnit = value;
        }
        let milliseconds = TIME_UNIT_MILLISECOND_MAP[intervalUnit];
        let newState = update(this.state, {scheduleData: {interval: {$set: intervalNumber * milliseconds || 0}}});
        this.setState(Object.assign(this.state, newState));
        // console.info(this.state.scheduleData.interval);
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

        if (key === 'images'){
            // validate images selection
            if (!this.state.scheduleData.images.length){
                this.validationUpdateState('images', {cn: '请选择镜像', en: 'please select image'}, false);
            }
            // each image can only create one schedule snapshot
            let checkOmeImageOneSchedule = true;
            for (let schedule of this.state.snapshotTaskList){
                let imagePath = schedule.pool_name + '/' + schedule.image_name;
                for (let _imagePath of this.state.scheduleData.images){
                    if (imagePath === _imagePath) {
                        checkOmeImageOneSchedule = false;
                        break;
                    }
                }
            }

            if (!checkOmeImageOneSchedule){
                this.validationUpdateState('images', {
                    cn: '在所选镜像中，有镜像已创建过一个定时快照任务',
                    en: 'ne of the selected images has already created a schedule task'
                } , false);
            }
        } else if (key === 'name'){
            // validate schedule name
            if (!validateFsName(this.state.scheduleData.name)){
                this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度3-30位',
                    en: 'name can only contains letter, number and underscore(except for the first place), length is 3-30'
                }, false);
            }
            // validate schedule name duplication
            let isScheduleNameDuplicated = this.state.scheduleData.images.some(imagePath => {
                let [poolName, imageName] = imagePath.split('/');
                return this.state.nameArray.includes(poolName + '/' + imageName + '/' + this.state.scheduleData.name);
            });
            if (isScheduleNameDuplicated){
                this.validationUpdateState('name', {cn: '名称已经存在', en: 'The name already existed'}, false);
            }
        } else if (key === 'interval'){
            if (!this.state.scheduleData.intervalNumber){
                this.validationUpdateState('interval', {cn: '请输入正整数', en: 'please enter a positive integer'}, false);
            }
        }
        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            // console.info(key + ' ' +this.state.validation[key].valid);
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    createSnapshotSchedule (){
        httpRequests.createSnapshotSchedule();
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
                } catch (reason){
                    message.error(lang(`删除定时快照任务 ${schedule.name} 失败, 原因: `, `Delete snapshot schedule ${schedule.name} failed, reason: `) + reason);
                }
            },
            onCancel: () => {

            }
        });
    }

    hide (){
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
                render: text => timeFormat(text)
            }, {
                title: lang('间隔时间', 'Interval Time'),
                dataIndex: 'interval',
                render: text => timeLeftFormat(text)
            }, {
                title: lang('创建时间', 'Create Time'),
                dataIndex: 'createTime',
                render: text => timeFormat(text)
            }, {
                title: lang('操作', 'Operations'),
                width: 80,
                render: (text, record, index) => <a onClick={this.deleteSchedule.bind(this, record, index)} title={lang('删除', 'delete')}>
                    <Icon style={{fontSize: 15}} type="delete" />
                </a>
            }],
        };
        return (
            <div className="fs-page-content fs-snapshot-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('定时快照', 'Snapshot Schedule')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <Input.Search style={{marginRight: 15, width: 150}} size="small"
                              placeholder={lang('定时快照名称', 'Snapshot schedule name')}
                              value={this.state.query}
                              onChange={this.queryChange.bind(this)}
                              onSearch={this.searchInTable.bind(this)}
                        />
                        <Button className="fs-create-snapshot-button"
                                size="small"
                                onClick={() => {this.setState({visible: true});}}
                        >
                            {lang('创建定时快照', 'Create Schedule')}
                        </Button>
                        <Table {...tableProps} />
                    </section>
                </section>
                <Modal title={lang('创建定时快照', 'Create Snapshot Schedule')}
                       width={320}
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
                        <Form.Item label={lang('任务名称', 'Schedule Name')}
                            validateStatus={this.state.validation.name.status}
                            help={this.state.validation.name.help}
                        >
                            <Input style={{width: 180}} size="small"
                                   value={this.state.scheduleData.name}
                                   onChange={({target: {value}}) => {
                                       this.formValueChange.bind(this, 'name')(value);
                                       this.validateForm.bind(this)('name');
                                   }}
                            />
                        </Form.Item>
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
                                                   this.intervalChange.bind(this, 'intervalNumber', value)();
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
                                        <Select style={{width: 80}} size="small"
                                            value={this.state.scheduleData.intervalUnit}
                                            onChange={value => {
                                                this.intervalChange.bind(this, 'intervalUnit', value)();
                                                this.formValueChange.bind(this, 'intervalUnit')(value);
                                                this.validateForm.bind(this)('interval');
                                            }}
                                        >
                                            <Select.Option value="Week">{lang('周', 'Week')}</Select.Option>
                                            <Select.Option value="Day">{lang('天', 'Day')}</Select.Option>
                                            <Select.Option value="Hour">{lang('小时', 'Hour')}</Select.Option>
                                            <Select.Option value="Minute">{lang('分钟', 'Minute')}</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item>
                            {lang('自动删除', 'Automatically Delete')}
                            <Switch style={{marginLeft: 10}} size="small"
                                checked={this.state.scheduleData.deleteRound}
                                onChange={checked => {
                                    this.formValueChange.bind(this, 'deleteRound')(checked);
                                }}
                            />
                            <Tooltip placement="right" title={lang(
                                '快照数量达到限制后自动删除此镜像上创建时间最早的自动快照',
                                'Delete the earliest periodic snapshot of this image automatically once total number reach its upper limit.'
                            )}>
                                <Icon type="question-circle" className="fs-info-icon m-l" />
                            </Tooltip>
                        </Form.Item>
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