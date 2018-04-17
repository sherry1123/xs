import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Popconfirm, Table} from 'antd';
import lang from "../../components/Language/lang";
import {timeFormat, validateFsName} from '../../services';
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

    formValueChange (key, value){
        let snapshotData = Object.assign({}, this.state.snapshotData, {[key]: value});
        this.setState({snapshotData});
    }

    async validateForm (key){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
        await this.setState({validation});
        if (key === 'name'){
            let {name} = this.state.snapshotData;
            if (!name){
                // no name enter
                await this.validationUpdateState('name', {
                    cn: '请输入快照名称',
                    en: 'please enter snapshot name'
                }, false);
            } else if (!validateFsName(name)){
                // name validate failed
                await this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位或末尾位）的组合，长度3-30位',
                    en: 'Name can only contains letter, number and underscore(except for the first), length is 3-30.'
                }, false);
            } else {
                let isNameDuplicated = this.props.snapshotList.some(snapshot => snapshot.name === name);
                if (isNameDuplicated){
                    // this name is duplicated with an existing snapshot's name
                    await this.validationUpdateState('name', {
                        cn: '该快照名称已经存在',
                        en: 'The snapshot name already existed'
                    }, false);
                }
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

    async createSnapshot (){
        let snapshotData = Object.assign({}, this.state.snapshotData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createSnapshot(snapshotData);
            httpRequests.getSnapshotList();
            await this.hide();
            message.success(lang('快照创建成功!', 'Snapshot created successfully!'));
        } catch ({msg}){
            message.error(lang('快照创建失败, 原因: ', 'Snapshot created failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    async deleteSnapshot (snapshot){
        try {
            await httpRequests.deleteSnapshot(snapshot);
            httpRequests.getSnapshotList();
            message.success(lang(`已开始删除快照 ${snapshot.name}!`, `Start deleting snapshot ${snapshot.name}!`));
        } catch ({msg}){
            message.error(lang(`删除快照 ${snapshot.name} 失败, 原因: `, `Delete snapshot ${snapshot.name} failed, reason: `) + msg);
        }
    }

    rollbackSnapshot (snapshot){
        Modal.confirm({
            title: lang(`确定回滚这个快照: ${snapshot.name} ?`, `Are you sure you want to rollback this snapshot: ${snapshot.name} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
            okText: lang('回滚', 'Roll Back'),
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

    batchDelete (){
        let {batchDeleteSnapshotNames} = this.state;
        let batchCount = batchDeleteSnapshotNames.length;
        if (!batchCount){
            message.warning(lang('请选择要批量删除的快照', 'Please select the snapshots which you want to delete in batch.'));
        } else {
            Modal.confirm({
                title: lang(`确定批量删除所选的这${batchCount}个快照?`, `Are you sure to delete the selected ${batchCount} snapshots in batch?`),
                content: lang('此操作不可恢复', 'You can\'t undo this action'),
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

    show (){
        this.setState({
            visible: true,
            // reset form data and validations
            formSubmitting: false,
            snapshotData: {name: ''},
            validation: {name: {status: '', help: '', valid: false}}
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let {batchDeleteSnapshotNames, snapshotList} = this.state;
        let rowSelection = {
            columnWidth: '2%',
            selectedRowKeys: batchDeleteSnapshotNames,
            onChange: (selectedRowKeys) => {
                this.setState({batchDeleteSnapshotNames: selectedRowKeys});
            },
            getCheckboxProps: record => ({
                disabled: record.deleting || record.rollbacking
            }),
        };
        let tableProps = {
            size: 'small',
            dataSource: snapshotList,
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项，选中 ${batchDeleteSnapshotNames.length} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items, selected ${batchDeleteSnapshotNames.length}`
                ),
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无快照', 'No Snapshot')
            },
            columns: [
                {title: lang('名称', 'Name'), width: 200, dataIndex: 'name',},
                {title: lang('定时创建', 'Timed Create'), width: 80, dataIndex: 'isAuto',
                    render: text => text ? lang('是', 'Yes') : lang('否', 'No')
                },
                {title: lang('创建时间', 'Create Time'), width: 120, dataIndex: 'createTime',
                    render: text => timeFormat(text)
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return (!record.rollbacking && !record.deleting) ?
                            <div>
                                <a onClick={this.rollbackSnapshot.bind(this, record, index)} title={lang('回滚', 'Roll Back')}>
                                    <Icon style={{fontSize: 15}} type="rollback" />
                                </a>
                                <Popconfirm placement="leftTop"
                                    title={lang(`确定删除这个快照: ${record.name} ?`, `Are you sure you want to delete this snapshot: ${record.name} ?`)}
                                    onConfirm={this.deleteSnapshot.bind(this, record, index)}
                                    okText={lang('确定', 'Yes')}
                                    cancelText={lang('取消', 'Cancel')}
                                >
                                    <a style={{marginLeft: 10}}><Icon style={{fontSize: 15}} type="delete" /></a>
                                </Popconfirm>
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
                            <Input.Search className="fs-search-table-input" size="small"
                                placeholder={lang('快照名称', 'snapshot name')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button className="fs-create-snapshot-button" size="small"
                                onClick={this.show.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                            <Button className="fs-batch-delete-snapshot-button" size="small"
                                disabled={!this.state.batchDeleteSnapshotNames.length}
                                onClick={this.batchDelete.bind(this)}
                            >
                                {lang('批量删除', 'Delete In Batch')}
                            </Button>
                        </div>
                        <Table rowSelection={rowSelection} {...tableProps} />
                    </section>
                </section>
                <Modal title={lang('创建快照', 'Create Snapshot')}
                    width={320}
                    visible={this.state.visible}
                    closable={false}
                    maskClosable={false}
                    footer={
                        <div>
                            <Button type="primary" disabled={!this.state.formValid} loading={this.state.formSubmitting}
                                size='small' onClick={this.createSnapshot.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                            <Button size='small' onClick={this.hide.bind(this)}>
                                {lang('取消', 'Cancel')}
                            </Button>
                        </div>
                    }
                >
                    <Form>
                        <Form.Item label={lang('快照名称', 'Snapshot Name')}
                            validateStatus={this.state.validation.name.status}
                            help={this.state.validation.name.help}
                        >
                            <Input style={{width: 270}} size='small'
                                   placeholder={lang('请输入快照名称', 'please enter snapshot name')}
                                   value={this.state.snapshotData.name}
                                   onChange={({target: {value}}) => {
                                       this.formValueChange.bind(this, 'name')(value);
                                       this.validateForm.bind(this)('name');
                                   }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {snapshot: {snapshotList}}} = state;
    return {language, snapshotList};
};

export default connect(mapStateToProps)(Snapshot);