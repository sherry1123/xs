import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Modal, Table} from 'antd';
import CreateSnapshot from './CreateSnapshot';
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
            enableBatchDelete: false,
            snapshotList,
            snapshotListBackup: snapshotList,
            // table items batch delete
            batchDeleteSnapshotNames: [],
            // form
            visible: false,
            formValid: false,
            formSubmitting: false,
            snapshotData: {
                name: ''
            },
            validation: {
                name: {status: '', help: '', valid: false}
            }
        };
    }

    componentDidMount (){
        httpRequests.getSnapshotList();
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
                snapshotList: Object.assign([], this.state.snapshotListBackup).filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({snapshotList: this.state.snapshotListBackup});
        }
    }

    create (){
        this.createSnapshotWrapper.getWrappedInstance().show();
    }

    rollback (snapshot){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行回滚快照 ${snapshot.name} 的操作。`, `You are about to rollback snapshot ${snapshot.name}.`)}</p>
                <p>{lang(`该操作将会将系统恢复至创建该快照的那个时间点的状态，在回滚期间内无法做任何操作。`, `This operation will recover system to the time point that create this snapshot at. Can't do any operations during rolling back.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的快照的创建时间是否是想要恢复到的时间点，并确保已无业务运行在系统上。`, `A suggestion: before executing this operation, ensure that the selected snapshot's create time is what you want the system to recover to, and ensure that there's no service is running on the system.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.rollbackSnapshot(snapshot);
                    httpRequests.getSnapshotList();
                    message.success(lang(`已开始回滚快照 ${snapshot.name}!`, `Start rolling back snapshot ${snapshot.name}!`));
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
        let {batchDeleteSnapshotNames} = this.state;
        let batchCount = batchDeleteSnapshotNames.length;
        if (!batchCount){
            message.warning(lang('请选择要批量删除的快照', 'Please select the snapshots which you want to delete in batch.'));
        } else {
            Modal.confirm({
                title: lang('警告', 'Warning'),
                content: <div style={{fontSize: 12}}>
                    <p>{lang(`您将要执行删除这 ${batchCount} 个快照的操作。`, `You are about to delete these ${batchCount} snapshot(s).`)}</p>
                    <p>{lang(`该操作将会从系统中删除这些快照。`, `This operation will delete the snapshot(s) from the system. `)}</p>
                    <p>{lang(`建议：在执行该操作前先确保您选择的快照是否正确，并确认它(们)已不再需要。`, `A suggestion: before executing this operation, ensure that you select the right snapshot(s) and it's(they're) no longer necessary.`)}</p>
                </div>,
                iconType: 'exclamation-circle-o',
                okText: lang('删除', 'Delete'),
                cancelText: lang('取消', 'Cancel'),
                onOk: async () => {
                    try {
                        await httpRequests.deleteSnapshotsInBatch(batchDeleteSnapshotNames);
                        await this.setState({batchDeleteSnapshotNames: []});
                        httpRequests.getSnapshotList();
                        message.success(lang('已开始批量删除快照！', 'Start deleting snapshots in batch!'));
                    } catch ({msg}){
                        message.error(lang('批量删除快照失败，原因：', 'Delete snapshots in batch failed, reason: ') + msg);
                    }
                },
                onCancel: () => {

                }
            });
        }
    }

    render (){
        let {batchDeleteSnapshotNames, snapshotList} = this.state;
        let tableProps = {
            size: 'small',
            dataSource: snapshotList,
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项，选中 ${batchDeleteSnapshotNames.length} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items, selected ${batchDeleteSnapshotNames.length}`
                ),
                size: 'normal',
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无快照', 'No Snapshot')
            },
            rowSelection: {
                columnWidth: '2%',
                selectedRowKeys: batchDeleteSnapshotNames,
                onChange: (selectedRowKeys) => {
                    this.setState({batchDeleteSnapshotNames: selectedRowKeys});
                },
                getCheckboxProps: record => ({
                    disabled: record.deleting || record.rollbacking
                }),
            },
            columns: [
                {title: lang('名称', 'Name'), width: 200, dataIndex: 'name',},
                {title: lang('定时计划创建', 'Timed Schedule Create'), width: 80, dataIndex: 'isAuto',
                    render: text => text ? lang('是', 'Yes') : lang('否', 'No')
                },
                {title: lang('创建时间', 'Create Time'), width: 120, dataIndex: 'createTime',
                    render: text => timeFormat(text)
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return (!record.rollbacking && !record.deleting) ?
                            <div>
                                <a onClick={this.rollback.bind(this, record, index)} title={lang('回滚', 'Roll Back')}>
                                    <Icon style={{fontSize: 15}} type="rollback" />
                                </a>
                                <a onClick={this.delete.bind(this, record, index)} title={lang('删除', 'Delete')} style={{marginLeft: 10}}>
                                    <Icon style={{fontSize: 15}} type="delete" />
                                </a>
                            </div> :
                            <a disabled>{record.rollbacking ? lang('回滚中', 'Rolling Back') : lang('删除中', 'Deleting')}</a>;
                    }
                }
            ],
        };
        return (
            <div className="fs-page-content fs-snapshot-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('快照', 'Snapshot')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <div className="fs-snapshot-operation-wrapper">
                            <Input.Search
                                className="fs-search-table-input" size="small"
                                placeholder={lang('快照名称', 'snapshot name')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button
                                className="fs-create-snapshot-button" size="small"
                                onClick={this.create.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                            <Button
                                className="fs-batch-delete-snapshot-button" size="small"
                                disabled={!this.state.batchDeleteSnapshotNames.length}
                                onClick={this.batchDelete.bind(this)}
                            >
                                {lang('批量删除', 'Delete In Batch')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                        <CreateSnapshot ref={ref => this.createSnapshotWrapper = ref} />
                    </section>
                </section>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {snapshot: {snapshotList}}} = state;
    return {language, snapshotList};
};

export default connect(mapStateToProps)(Snapshot);