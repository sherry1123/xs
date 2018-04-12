import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Table} from 'antd';
import lang from "../../components/Language/lang";
import {formatStorageSize, timeFormat, validateFsName} from '../../services';
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
                snapshotList: Object.assign([], this.state.snapshotListBackup).filter(({name}) => name.match(query))
            });
        } else {
            this.setState({snapshotList: this.state.snapshotListBackup});
        }
    }

    delete (name){
        Modal.confirm({
            title: lang(`确定删除这个快照: ${name} ?`, `Are you sure you want to delete this snapshot: ${name} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: () => {

            },
            onCancel: () => {

            }
        });
    }

    rollback (name){
        Modal.confirm({
            title: lang(`确定回滚这个快照: ${name} ?`, `Are you sure you want to rollback this snapshot: ${name} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
            okText: lang('回滚', 'Roll Back'),
            cancelText: lang('取消', 'Cancel'),
            onOk: () => {

            },
            onCancel: () => {

            }
        });
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
            this.setState({formSubmitting: false});
        } catch ({msg}){
            message.success(lang('快照创建失败, 原因: ', 'Snapshot created failed, reason: ') + msg);
            this.setState({formSubmitting: false});
        }
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let tableProps = {
            dataSource: this.state.snapshotList,
            pagination: true,
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无快照', 'No Snapshot')
            },
            columns: [
                {title: lang('名称', 'Name'), width: 125, dataIndex: 'name',},
                {title: lang('大小', 'Size'), width: 120, dataIndex: 'size',
                    render: (text) => formatStorageSize(text)
                },
                {title: lang('创建时间', 'Create Time'), width: 120, dataIndex: 'createTime',
                    render: (text) => timeFormat(text)
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record) => (
                        <div>
                            <a title={lang('回滚', 'Rollback')}
                               onClick={this.rollback.bind(this, record.name)}
                            >
                                <Icon style={{fontSize: 15}} type="rollback" />
                            </a>
                            <a title={lang('删除', 'Delete')}
                               onClick={this.delete.bind(this, record.name)}
                               style={{marginLeft: 10}}
                            >
                                <Icon style={{fontSize: 15}} type="delete" />
                            </a>
                        </div>
                    )
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
                        <Input.Search style={{marginRight: 15, width: 150}} size="small"
                            placeholder={lang('快照名称', 'snapshot name')}
                            value={this.state.query}
                            onChange={this.queryChange.bind(this)}
                            onSearch={this.searchInTable.bind(this)}
                        />
                        <Button className="fs-create-snapshot-button"
                            size="small"
                            onClick={() => {this.setState({visible: true});}}
                        >
                            {lang('创建快照', 'Create Snapshot')}
                        </Button>
                        <Table {...tableProps} />
                    </section>
                </section>
                <Modal title={lang('创建快照', 'Create Snapshot')}
                    width={250}
                    closable={false}
                    maskClosable={false}
                    visible={this.state.visible}
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
                            <Input style={{width: 150}} size='small'
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