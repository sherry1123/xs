import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Icon, Input, message, Modal, Switch, Table} from "antd";
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
            batchDeleteScheduleNames: [],
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
        let {batchDeleteScheduleNames} = this.state;
        let batchCount = batchDeleteScheduleNames.length;
        if (!batchCount){
            message.warning(lang('请选择要批量删除的定时快照计划', 'Please select the timed snapshot schedules which you want to delete in batch.'));
        } else {
            Modal.confirm({
                title: lang('警告', 'Warning'),
                content: <div style={{fontSize: 12}}>
                    <p>{lang(`您将要执行删除这 ${batchCount} 个定时快照计划的操作。`, `You are about to delete these ${batchCount} timed snapshot schedule(s).`)}</p>
                    <p>{lang(`该操作将会从系统中删除这些定时快照计划。`, `This operation will delete the schedule(s) from the system. `)}</p>
                    <p>{lang(`建议：在执行该操作前先确保您选择的计划是否正确，并确认它已不再需要。为保证数据安全，请在删除该计划后，立即启用另外一个计划。`, `A suggestion: before executing this operation, ensure that you select the right schedule(s) and it's(they're) no longer necessary. In order to ensure data security, you should execute another schedule after delete this one.`)}</p>
                </div>,
                iconType: 'exclamation-circle-o',
                okText: lang('删除', 'Delete'),
                cancelText: lang('取消', 'Cancel'),
                onOk: async () => {
                    try {
                        await httpRequests.deleteSnapshotSchedulesInBatch(batchDeleteScheduleNames);
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
    }

    render (){
        let {batchDeleteScheduleNames, snapshotScheduleList} = this.state;
        let tableProps = {
            dataSource: snapshotScheduleList,
            size: 'small',
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项，选中 ${batchDeleteScheduleNames.length} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items, selected ${batchDeleteScheduleNames.length}`
                ),
                size: 'normal',
            },
            locale: {
                emptyText: lang('暂无定时快照', 'No Snapshot Schedule')
            },
            rowKey: 'name',
            rowSelection: {
                columnWidth: '2%',
                selectedRowKeys: batchDeleteScheduleNames,
                onChange: (selectedRowKeys) => {
                    this.setState({batchDeleteScheduleNames: selectedRowKeys});
                },
            },
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
                        size="small" style={{marginTop: -6}}
                        title={record.isRunning ? lang('关闭', 'Disable') : lang('执行', 'Execute')}
                        checked={record.isRunning}
                        onChange={this.switch.bind(this, record, index)}
                    />
                    <a
                        onClick={this.edit.bind(this, record)}
                        title={lang('编辑', 'Edit')}
                        style={{marginLeft: 10}}
                    >
                        <Icon style={{fontSize: 15}} type="edit" />
                    </a>
                    <a
                        onClick={this.delete.bind(this, record, index)}
                        title={lang('删除', 'Delete')}
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
                            <Input.Search
                                style={{marginRight: 15, width: 170}}
                                size="small"
                                placeholder={lang('计划名称', 'schedule name')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button
                                className="fs-create-snapshot-button"
                                size="small"
                                onClick={this.create.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                            <Button
                                className="fs-batch-delete-snapshot-button" size="small"
                                disabled={!this.state.batchDeleteScheduleNames.length}
                                onClick={this.batchDelete.bind(this)}
                            >
                                {lang('批量删除', 'Delete In Batch')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                        <CreateSnapshotSchedule ref={ref => this.createSnapshotScheduleWrapper = ref} />
                        <EditSnapshotSchedule ref={ref => this.editSnapshotScheduleWrapper = ref} />
                    </section>
                </section>

            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {snapshot: {snapshotScheduleList}}} = state;
    return {language, snapshotScheduleList};
};

export default connect(mapStateToProps)(SnapshotSchedule);