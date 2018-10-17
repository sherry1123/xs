import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Modal, Popover, Table} from 'antd';
import CreateLocalAuthUser from './CreateLocalAuthUser';
import EditLocalAuthUser from './EditLocalAuthUser';
import SecurityStrategySetting from './SecurityStrategySetting';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language, main: {localAuthUser: {localAuthUserList}}} = state;
    return {language, localAuthUserList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
export default class LocalAuthUser extends Component {
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

    enableLocalAuthUser (userData){
        let {name} = userData;
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行启用本地认证用户 ${name} 的操作。`, `You are about to enable local authentication user ${name}.`)}</p>
                <p>{lang(`该操作将该用户处于可用状态，在未过期状态下可以访问共享数据。`, `This operation will let user available, and can access share data without overdue status.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的本地认证用户是否正确，并确认是否需要启用他。`, `A suggestion: before executing this operation, determine whether the local authentication user needs to be enabled.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okType: 'warning',
            okText: lang('启用', 'Enable'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    await httpRequests.updateLocalAuthUserStatus(name, true);
                    httpRequests.getLocalAuthUserList();
                    message.success(lang(`启用本地认证用户 ${name} 成功!`, `Enable local authentication user ${name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`启用本地认证用户 ${name} 失败, 原因: `, `Enable local authentication user ${name} failed, reason: `) + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    disableLocalAuthUser (userData){
        let {name} = userData;
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行禁用本地认证用户 ${name} 的操作。`, `You are about to disable local authentication user ${name}.`)}</p>
                <p>{lang(`该操作将该用户处于不可用状态，不可以访问共享数据。`, `This operation will let user available, and can't access share data any more.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的本地认证用户是否正确，并确认是否需要禁用他。`, `A suggestion: before executing this operation, determine whether the local authentication user needs to be disabled.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okType: 'warning',
            okText: lang('禁用', 'Disable'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    await httpRequests.updateLocalAuthUserStatus(name, false);
                    httpRequests.getLocalAuthUserList();
                    message.success(lang(`禁用本地认证用户 ${name} 成功!`, `Disable local authentication user ${name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`禁用本地认证用户 ${name} 失败, 原因: `, `Disable local authentication user ${name} failed, reason: `) + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    delete (userData){
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除本地认证用户 ${userData.name} 的操作。`, `You are about to delete local authentication user ${userData.name}.`)}</p>
                <p>{lang(`该操作将导致该用户无法继续访问共享数据，业务中断。`, `This operation will cause access exceptions on this user.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的本地认证用户是否正确，并确认它不再需要。`, `A suggestion: before executing this operation, determine whether the local authentication user is necessary.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    await httpRequests.deleteLocalAuthUser(userData);
                    httpRequests.getLocalAuthUserList();
                    message.success(lang(`删除本地认证用户 ${userData.name} 成功!`, `Delete local authentication user ${userData.name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除本地认证用户 ${userData.name} 失败, 原因: `, `Delete local authentication user ${userData.name} failed, reason: `) + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    batchDelete (){
        let {batchDeleteNames} = this.state;
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除这 ${batchDeleteNames.length} 个本地认证用户的操作。`, `You are about to delete these ${batchDeleteNames.length} local authentication users.`)}</p>
                <p>{lang(`该操作将导致这些用户无法继续访问共享数据，业务中断`, `This operation will cause access exceptions on these users.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保您选择的本地认证用户是否正确，并确认它不再需要。`, `A suggestion: before executing this operation, determine whether the local authentication users are necessary.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    await httpRequests.deleteLocalAuthUserInBatch(batchDeleteNames);
                    this.setState({batchDeleteNames: []});
                    httpRequests.getLocalAuthUserList();
                    message.success(lang('批量删除本地认证用户成功！', 'Delete local authentication users in batch successfully!'));
                } catch ({msg}){
                    message.error(lang('批量删除本地认证用户成功，原因：', 'Delete local authentication users in batch, reason: ') + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    securityStrategySetting (){
        this.securityStrategySettingWrapper.getWrappedInstance().show();
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
            pagination: localAuthUserList.length > 12 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项，选中 ${batchDeleteNames.length} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items, selected ${batchDeleteNames.length}`
                ),
                size: 'normal',
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
            title: () => (<span className="fs-table-title"><Icon type="user" />{lang('本地认证用户', 'Local Authentication User')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('名称', 'Name'), width: 120, dataIndex: 'name',},
                {title: lang('主组', 'Primary Group'), width: 100, dataIndex: 'primaryGroup',},
                {title: lang('附属组', 'Secondary Group'), width: '20%', dataIndex: 'secondaryGroup',
                    render: text => !text.length ? '--' : text.join(',')
                },
                {title: lang('描述', 'Description'), width: '20%', dataIndex: 'description',
                    render: text => !text ? '--' : text
                },
                {title: lang('状态', 'Status'), width: 70, dataIndex: 'status',
                    render: text => text ?
                        <span className="fs-green">{lang('已启用', 'Enabled')}</span> :
                        <span className="fs-red">{lang('已禁用', 'Disabled')}</span>
                },
                {title: lang('有效期', 'Validity Period'), width: 125, dataIndex: 'validityPeriod',
                    render: text => `${text}${lang('天', 'Day(s)')}`
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
                            {
                                record.status ? <Popover {...buttonPopoverConf} content={lang('禁用', 'Disable')}>
                                    <Button
                                        {...buttonConf}
                                        onClick={this.disableLocalAuthUser.bind(this, record, index)}
                                        icon="disconnect"
                                    />
                                </Popover> :
                                <Popover {...buttonPopoverConf} content={lang('启用', 'Enable')}>
                                    <Button
                                        {...buttonConf}
                                        onClick={this.enableLocalAuthUser.bind(this, record, index)}
                                        icon="api"
                                    />
                                </Popover>
                            }
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
                            type="warning"
                            size="small"
                            onClick={this.securityStrategySetting.bind(this)}
                        >
                            {lang('安全策略', 'Security Strategy')}
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
                <SecurityStrategySetting ref={ref => this.securityStrategySettingWrapper = ref} />
            </div>
        );
    }
}