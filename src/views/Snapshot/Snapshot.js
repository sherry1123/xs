import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Modal, Popover, Table} from 'antd';
import CreateSnapshot from './CreateSnapshot';
import EditSnapshot from './EditSnapshot';
import SetSnapshot from './SetSnapshot';
import lang from "../../components/Language/lang";
import {timeFormat} from '../../services';
import httpRequests from '../../http/requests';

class Snapshot extends Component {
    constructor (props){
        super(props);
        let {snapshotList} = this.props;
        this.state = {
            // table
            query: '',
            snapshotList,
            snapshotListBackup: snapshotList,
            // table items batch delete
            batchDeleteNames: [],
        };
    }

    componentDidMount (){
        httpRequests.getSnapshotList();
        httpRequests.getSnapshotSetting();
    }

    async componentWillReceiveProps (nextProps){
        let {snapshotList} = nextProps;
        await this.setState({snapshotList, snapshotListBackup: snapshotList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                snapshotList: [...this.state.snapshotListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({snapshotList: this.state.snapshotListBackup});
        }
    }

    create (){
        let {snapshotList, snapshotSetting: {manual}} = this.props;
        let manualSnapshotNumber = 0;
        snapshotList.forEach(({isAuto}) => !isAuto && (manualSnapshotNumber ++));
        if (manualSnapshotNumber >= manual){
            message.warning(lang(
                `手动快照数量已达到限制数量${manual}个，请在创建之前先删除一些！`,
                `Manual snapshot number has reached the maximum ${manual}, please firstly delete some before creating!`
            ));
        } else {
            this.createSnapshotWrapper.getWrappedInstance().show();
        }
    }

    setting (){
        this.setSnapshotWrapper.getWrappedInstance().show();
    }

    edit (snapshotData){
        this.editSnapshotWrapper.getWrappedInstance().show(snapshotData);
    }

    rollback (snapshot){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行回滚快照 ${snapshot.name} 的操作。`, `You are about to rollback snapshot ${snapshot.name}.`)}</p>
                <p>{lang(`该操作将会将系统恢复至创建该快照的那个时间点的状态，在回滚期间内无法做任何操作。也请您`, `This operation will recover system to the time point that create this snapshot at. Can't do any operations during rolling back.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的快照的创建时间是否是想要恢复到的时间点，并确保已无业务运行在系统上。`, `A suggestion: before executing this operation, ensure that the selected snapshot's create time is what you want the system to recover to, and ensure that there's no service is running on the system.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('回滚', 'Rollback'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.rollbackSnapshot(snapshot);
                    httpRequests.getSnapshotList();
                    // message.success(lang(`已开始回滚快照 ${snapshot.name}!`, `Start rolling back snapshot ${snapshot.name}!`));
                } catch ({msg}){
                    message.error(lang(`回滚快照 ${snapshot.name} 失败, 原因: `, `Rollback snapshot ${snapshot.name} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    delete (snapshot){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除快照 ${snapshot.name} 的操作。`, `You are about to delete snapshot ${snapshot.name}.`)}</p>
                <p>{lang(`该操作将会从系统中删除该快照。`, `This operation will delete this snapshot from the system. `)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的快照是否正确，并确认它已不再需要。`, `A suggestion: before executing this operation, ensure that you select the right snapshot and it's no longer necessary.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteSnapshot(snapshot);
                    httpRequests.getSnapshotList();
                    message.success(lang(`已开始删除快照 ${snapshot.name}!`, `Start deleting snapshot ${snapshot.name}!`));
                } catch ({msg}){
                    message.error(lang(`删除快照 ${snapshot.name} 失败, 原因: `, `Delete snapshot ${snapshot.name} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    batchDelete (){
        let {batchDeleteNames} = this.state;
        let batchDeleteModal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除这 ${batchDeleteNames.length} 个快照的操作。`, `You are about to delete these ${batchDeleteNames.length} snapshot(s).`)}</p>
                <p>{lang(`该操作将会从系统中删除这些快照。`, `This operation will delete the snapshot(s) from the system. `)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的快照是否正确，并确认它(们)已不再需要。`, `A suggestion: before executing this operation, ensure that you select the right snapshot(s) and it's(they're) no longer necessary.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteSnapshotsInBatch(batchDeleteNames);
                    await this.setState({batchDeleteNames: []});
                    httpRequests.getSnapshotList();
                    message.success(lang('已开始批量删除快照！', 'Start deleting snapshots in batch!'));
                } catch ({msg}){
                    message.error(lang('批量删除快照失败，原因：', 'Delete snapshots in batch failed, reason: ') + msg);
                }
            },
            onCancel: () => {
                batchDeleteModal.destroy();
            }
        });
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {batchDeleteNames, snapshotList} = this.state;
        let snapshotHandling = snapshotList.some(snapshot => snapshot.creating || snapshot.deleting || snapshot.rollbacking);
        let tableProps = {
            size: 'normal',
            dataSource: snapshotList,
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项，选中 ${batchDeleteNames.length} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items, selected ${batchDeleteNames.length}`
                ),
                size: 'normal',
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无快照', 'No Snapshot')
            },
            rowSelection: {
                columnWidth: '2%',
                selectedRowKeys: batchDeleteNames,
                onChange: selectedRowKeys => this.setState({batchDeleteNames: selectedRowKeys}),
                getCheckboxProps: record => ({
                    disabled: record.deleting || record.rollbacking
                }),
            },
            title: () => (<span className="fs-table-title"><Icon type="camera" />{lang('快照', 'Snapshot')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('名称', 'Name'), width: 200, dataIndex: 'name',},
                {title: lang('定时计划创建', 'Timed Schedule Create'), width: 80, dataIndex: 'isAuto',
                    render: text => text ? lang('是', 'Yes') : lang('否', 'No')
                },
                {title: lang('创建时间', 'Create Time'), width: 120, dataIndex: 'createTime',
                    render: (text, record) => record.creating ? '--' : timeFormat(text)
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return (!record.creating && !record.deleting && !record.rollbacking) ?
                            <div>
                                <Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
                                    <Button
                                        {...buttonConf}
                                        disabled={snapshotHandling}
                                        onClick={this.edit.bind(this, record)}
                                        icon="edit"
                                    />
                                </Popover>
                                <Popover {...buttonPopoverConf} content={lang('回滚', 'Roll Back')}>
                                    <Button
                                        {...buttonConf}
                                        disabled={snapshotHandling}
                                        onClick={this.rollback.bind(this, record, index)}
                                        icon="rollback"
                                    />
                                </Popover>
                                <Popover {...buttonPopoverConf} content={lang('删除', 'Delete')}>
                                    <Button
                                        {...buttonConf}
                                        disabled={snapshotHandling}
                                        onClick={this.delete.bind(this, record, index)}
                                        icon="delete"
                                    />
                                </Popover>
                            </div> :
                            <a disabled>
                                {
                                    record.creating ? lang('创建中', 'Creating') :
                                        record.deleting ? lang('删除中', 'Deleting') : lang('回滚中', 'Rolling Back')
                                }
                            </a>;
                    }
                }
            ],
        };
        return (
            <div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <Input.Search
                        disabled={snapshotHandling}
                        size="small"
                        placeholder={lang('快照名称', 'snapshot name')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <div className="fs-table-operation-button-box">
                        <Button
                            type="primary"
                            size="small"
                            disabled={snapshotHandling}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                        <Button
                            type="warning"
                            size="small"
                            disabled={snapshotHandling}
                            className="fs-create-snapshot-button"
                            onClick={this.setting.bind(this)}
                        >
                            {lang('设置', 'Setting')}
                        </Button>
                        <Button
                            type="danger"
                            size="small"
                            disabled={!this.state.batchDeleteNames.length || snapshotHandling}
                            onClick={this.batchDelete.bind(this)}
                        >
                            {lang('批量删除', 'Delete In Batch')}
                        </Button>
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <CreateSnapshot ref={ref => this.createSnapshotWrapper = ref} />
                <EditSnapshot ref={ref => this.editSnapshotWrapper = ref} />
                <SetSnapshot ref={ref => this.setSnapshotWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {snapshot: {snapshotList, snapshotSetting}}} = state;
    return {language, snapshotList, snapshotSetting};
};

export default connect(mapStateToProps)(Snapshot);