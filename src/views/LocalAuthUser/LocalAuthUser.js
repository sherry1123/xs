import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Icon, Input, message, Modal, Popover, Table} from "antd";
import CreateLocalAuthUser from './CreateLocalAuthUser';
import EditLocalAuthUser from './EditLocalAuthUser';
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class LocalAuthUser extends Component {
    constructor (props){
        super(props);
        let {localAuthUserList} = this.props;
        this.state = {
            // table
            query: '',
            localAuthUserList,
            localAuthUserListBackup: localAuthUserList,
            // table items batch delete
            batchDeleteNames: [],
        };
    }

    componentDidMount (){
        httpRequests.getLocalAuthUserList();
    }

    async componentWillReceiveProps (nextProps){
        let {localAuthUserList} = nextProps;
        await this.setState({localAuthUserList, localAuthUserListBackup: localAuthUserList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                localAuthUserList: [...this.state.localAuthUserListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({localAuthUserList: this.state.localAuthUserListBackup});
        }
    }

    create (){
        this.createLocalAuthUserWrapper.getWrappedInstance().show();
    }

    edit (user){
        this.editLocalAuthUserWrapper.getWrappedInstance().show(user);
    }

    delete (userData){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除本地认证用户 ${userData.name} 的操作。`, `You are about to delete local authentication user ${userData.name}.`)}</p>
                <p>{lang(`该操作将导致该用户无法继续访问共享数据，业务中断。`, `This operation will cause access exceptions on this user.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的本地认证用户是否正确，并确认它不再需要。`, `A suggestion: before executing this operation, determine whether the local authentication user is necessary.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteLocalAuthUser(userData);
                    httpRequests.getLocalAuthUserList();
                    message.success(lang(`删除本地认证用户 ${userData.name} 成功!`, `Delete local authentication user ${userData.name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除本地认证用户 ${userData.name} 失败, 原因: `, `Delete local authentication user ${userData.name} failed, reason: `) + msg);
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
                <p>{lang(`您将要执行删除这 ${batchDeleteNames.length} 个本地认证用户的操作。`, `You are about to delete these ${batchDeleteNames.length} local authentication users.`)}</p>
                <p>{lang(`该操作将导致这些用户无法继续访问共享数据，业务中断`, `This operation will cause access exceptions on these users.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的本地认证用户是否正确，并确认它不再需要。`, `A suggestion: before executing this operation, determine whether the local authentication users are necessary.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteLocalAuthUserInBatch(batchDeleteNames);
                    await this.setState({batchDeleteNames: []});
                    httpRequests.getLocalAuthUserList();
                    message.success(lang('批量删除本地认证用户成功！', 'Delete local authentication users in batch successfully!'));
                } catch ({msg}){
                    message.error(lang('批量删除本地认证用户成功，原因：', 'Delete local authentication users in batch, reason: ') + msg);
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
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {batchDeleteNames, localAuthUserList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: localAuthUserList,
            pagination: {
                size: 'normal',
                pageSize: 10,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无本地认证用户', 'No local authentication user')
            },
            rowSelection: {
                columnWidth: '2.5%',
                selectedRowKeys: batchDeleteNames,
                onChange: selectedRowKeys => this.setState({batchDeleteNames: selectedRowKeys}),
            },
            title: () => (<span className="fs-table-title"><Icon type="user-add" />{lang('本地认证用户', 'Local Authentication User')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('名称', 'Name'), width: 120, dataIndex: 'name',},
                {title: lang('状态', 'Status'), width: 70, dataIndex: 'type',
                    render: () => lang('正常', 'Normal')
                },
                {title: lang('主组', 'Primary Group'), width: 100, dataIndex: 'primaryGroup',},
                {title: lang('附属组', 'Secondary Group'), width: '20%', dataIndex: 'secondaryGroup',
                    render: text => !text.length ? '--' : text.join(',')
                },
                {title: lang('描述', 'Description'), width: '20%', dataIndex: 'description',
                    render: text => !text ? '--' : text
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return <div>
                            <Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.edit.bind(this, record, index)}
                                    icon="edit"
                                />
                            </Popover>
                            <Popover {...buttonPopoverConf} content={lang('删除', 'Delete')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.delete.bind(this, record, index)}
                                    icon="delete"
                                />
                            </Popover>
                        </div>;
                    }
                }
            ],
        };
        return (
            <div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <Input.Search
                        size="small"
                        placeholder={lang('用户名称', 'Username')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <div className="fs-table-operation-button-box">
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
                            disabled={!batchDeleteNames.length}
                            onClick={this.batchDelete.bind(this)}
                        >
                            {lang('批量删除', 'Delete In Batch')}
                        </Button>
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <CreateLocalAuthUser ref={ref => this.createLocalAuthUserWrapper = ref} />
                <EditLocalAuthUser ref={ref => this.editLocalAuthUserWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {localAuthUser: {localAuthUserList}}} = state;
    return {language, localAuthUserList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(LocalAuthUser);