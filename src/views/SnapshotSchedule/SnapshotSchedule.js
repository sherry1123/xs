import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Icon, Input, message, Modal, Popover, Switch, Table} from "antd";
import CreateSnapshotSchedule from './CreateSnapshotSchedule';
import EditSnapshotSchedule from './EditSnapshotSchedule';
import lang from "../../components/Language/lang";
import {timeLeftFormat, timeFormat} from "../../services/index";
import httpRequests from '../../http/requests';

class SnapshotSchedule extends Component {
    constructor (props){
        super(props);
        let {snapshotScheduleList} = this.props;
        this.state = {
            query: '',
            snapshotScheduleList,
            snapshotScheduleListBackup: snapshotScheduleList,
            // table items batch delete
            batchDeleteNames: [],
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
            await this.setState({
                query,
                snapshotScheduleList: [...this.state.snapshotScheduleListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({snapshotScheduleList: this.state.snapshotScheduleListBackup});
        }
    }

    create (){
        this.createSnapshotScheduleWrapper.getWrappedInstance().show();
    }

    edit (scheduleData){
        this.editSnapshotScheduleWrapper.getWrappedInstance().show(scheduleData);
    }

    async switch (snapshotSchedule, index, checked){
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
                    await this.setState({snapshotScheduleList});
                    httpRequests.getSnapshotScheduleList();
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
                await this.setState({snapshotScheduleList});
                httpRequests.getSnapshotScheduleList();
            } catch (e){
                message.error(lang(`关闭定时快照计划 ${snapshotSchedule.name} 失败！`, `Disable timed snapshot schedule ${snapshotSchedule.name} failed!`));
            }
        }
    }

    delete (schedule, index){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除定时快照计划 ${schedule.name} 的操作。`, `You are about to delete timed snapshot schedule ${schedule.name}.`)}</p>
                <p>{lang(`该操作将会从系统中删除该计划。并且如果该计划已启用，删除它可能会导致当前的定时创建快照功能失效。`, `This operation will delete this schedule from the system. If this schedule is enabled, delete it will make the time create snapshot function lose its effectiveness.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的计划是否正确，并确认它已不再需要。为保证数据安全，请在删除该计划后，立即启用另外一个计划。`, `A suggestion: before executing this operation, ensure that you select the right schedule and it's no longer necessary. In order to ensure data security, you should execute another schedule after delete this one.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
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

    batchDelete (){
        let {batchDeleteNames} = this.state;
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除这 ${batchDeleteNames.length} 个定时快照计划的操作。`, `You are about to delete these ${batchDeleteNames.length} timed snapshot schedule(s).`)}</p>
                <p>{lang(`该操作将会从系统中删除这些定时快照计划。`, `This operation will delete the schedule(s) from the system. `)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的计划是否正确，并确认它已不再需要。为保证数据安全，请在删除该计划后，立即执行用另外一个计划。`, `A suggestion: before executing this operation, ensure that you select the right schedule(s) and it's(they're) no longer necessary. In order to ensure data security, you should execute another schedule after delete this one.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteSnapshotSchedulesInBatch(batchDeleteNames);
                    await this.setState({batchDeleteSnapshotNames: []});
                    httpRequests.getSnapshotScheduleList();
                    message.success(lang('批量删除定时快照计划成功！', 'Delete timed snapshot schedules in batch successfully!'));
                } catch ({msg}){
                    message.error(lang('批量删除定时快照计划失败，原因：', 'Delete timed snapshot schedules in batch failed, reason: ') + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {batchDeleteNames, snapshotScheduleList} = this.state;
        let tableProps = {
            dataSource: snapshotScheduleList,
            size: 'normal',
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项，选中 ${batchDeleteNames.length} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items, selected ${batchDeleteNames.length}`
                ),
                size: 'normal',
            },
            locale: {
                emptyText: lang('暂无定时快照', 'No Snapshot Schedule')
            },
            rowKey: 'name',
            rowSelection: {
                columnWidth: '3%',
                selectedRowKeys: batchDeleteNames,
                onChange: selectedRowKeys => this.setState({batchDeleteNames: selectedRowKeys}),
            },
            title: () => (<span className="fs-table-title"><Icon type="database" />{lang('定时快照计划', 'Timed snapshot schedule')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [{
                title: lang('名称', 'Name'), dataIndex: 'name',
            }, {
                title: lang('自动删除', 'Automatically Delete'), dataIndex: 'deleteRound',
                render: text => text ? lang('是', 'Yes') : lang('否', 'No')
            }, {
                title: lang('开始时间', 'Start Time'), dataIndex: 'startTime', width: 180,
                render: (text, record) => record.isRunning ? timeFormat(text) : '--'
            }, {
                title: lang('间隔时间', 'Interval Time'), dataIndex: 'interval',
                render: text => timeLeftFormat(text)
            }, {
                title: lang('自动延时关闭时间', 'Auto Delay Disable Time'), dataIndex: 'autoDisableTime',
                render: text => text !== 0 ? timeLeftFormat(text) : '--'
            }, {
                title: lang('创建时间', 'Create Time'), dataIndex: 'createTime', width: 180,
                render: text => timeFormat(text)
            }, {
                title: lang('操作', 'Operations'), width: 120,
                render: (text, record, index) => <div>
                    <Switch
                        size="small" style={{marginTop: -2, marginRight: 5}}
                        title={record.isRunning ? lang('关闭', 'Disable') : lang('执行', 'Execute')}
                        checked={record.isRunning}
                        onChange={this.switch.bind(this, record, index)}
                    />
                    <Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
                        <Button
                            {...buttonConf}
                            icon="edit"
                            onClick={this.edit.bind(this, record)}
                        />
                    </Popover>
                    <Popover {...buttonPopoverConf} content={lang('删除', 'Delete')}>
                        <Button
                            {...buttonConf}
                            icon="delete"
                            onClick={this.delete.bind(this, record, index)}
                        />
                    </Popover>
                </div>

            }],
        };
        return (
            <div className="fs-page-content fs-snapshot-wrapper">
                <div className="fs-table-operation-wrapper">
                    <Input.Search
                        size="small"
                        placeholder={lang('定时快照计划名称', 'Time snapshot schedule name')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <div className="fs-button-box">
                        <Button
                            type="primary"
                            size="small"
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                        <Button
                            type="danger"
                            size="small"
                            disabled={!this.state.batchDeleteNames.length}
                            onClick={this.batchDelete.bind(this)}
                        >
                            {lang('批量删除', 'Delete In Batch')}
                        </Button>
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <CreateSnapshotSchedule ref={ref => this.createSnapshotScheduleWrapper = ref} />
                <EditSnapshotSchedule ref={ref => this.editSnapshotScheduleWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {snapshot: {snapshotScheduleList}}} = state;
    return {language, snapshotScheduleList};
};

export default connect(mapStateToProps)(SnapshotSchedule);