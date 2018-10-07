import React, {Component} from 'react';
import {connect} from 'react-redux';
import shareAction from 'Actions/shareAction';
import {Button, Icon, Input, message, Modal, Popover, Table} from 'antd';
import EditUserOrGroupOfCIFS from './EditUserOrGroupOfCIFS';
import AddLocalAuthUserToCIFS from './AddLocalAuthUserToCIFS';
import AddLocalAuthUserGroupToCIFS from './AddLocalAuthUserGroupToCIFS';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class UserOrGroupOfCIFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            share: {},
            loadingList: true,
            localAuthUserOrGroupListOfCIFS: [],
            localAuthUserOrGroupListOfCIFSBackup: [],
        };
    }

    async componentWillReceiveProps (nextProps){
        let {localAuthUserOrGroupListOfCIFS} = nextProps;
        await this.setState({localAuthUserOrGroupListOfCIFS, localAuthUserOrGroupListOfCIFSBackup: localAuthUserOrGroupListOfCIFS});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                localAuthUserOrGroupListOfCIFS: [...this.state.localAuthUserOrGroupListOfCIFSBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({localAuthUserOrGroupListOfCIFS: this.state.localAuthUserOrGroupListOfCIFSBackup});
        }
    }

    edit (itemData){
        this.editUserOrGroupOfCIFSWrapper.getWrappedInstance().show({
            itemData,
            share: this.state.share,
        });
    }

    remove (item, index){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行移除用户/用户组 ${item.name} 的操作。`, `You are about to delete user/user group ${item.name}`)}</p>
                <p>{lang(`该操作将导致通过该用户/用户组访问CIFS共享的业务中断。`, `This operation will interrupt the CIFS share service that is being accessed through this user/user group.`)}</p>
                <p>{lang(`建议：执行该操作前请确保该用户/用户组上无任何业务运行。`, `A suggestion: Before deleting a user/user group, ensure that the user/user group is not accessing shared resources.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    let {share: {name: shareName, path: sharePath}} = this.state;
                    item = Object.assign({}, item, {shareName, sharePath});
                    await httpRequests.removeLocalAuthUserOrGroupFromCIFSShare(item);
                    let localAuthUserOrGroupListOfCIFS = Object.assign([], this.state.localAuthUserOrGroupListOfCIFS);
                    localAuthUserOrGroupListOfCIFS.splice(index, 1);
                    this.setState({localAuthUserOrGroupListOfCIFS});
                    message.success(lang(`删除用户/用户组 ${item.name} 成功!`, `Delete user/user group ${item.name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除用户/用户组 ${item.name} 失败, 原因: `, `Delete user/user group ${item.name} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    showAddUser (){
        let {localAuthUserOrGroupListOfCIFS, share} = this.state;
        let localAuthUserListOfCIFS = localAuthUserOrGroupListOfCIFS.filter(item => item.type === 'local_user');
        this.addLocalAuthUserToCIFSWrapper.getWrappedInstance().show({
            localAuthUserListOfCIFS,
            share,
            notDirectlyCreate: false
        });
    }

    showAddGroup (){
        let {localAuthUserOrGroupListOfCIFS, share} = this.state;
        let localAuthUserGroupListOfCIFS = localAuthUserOrGroupListOfCIFS.filter(item => item.type === 'local_group');
        this.addLocalAuthUserGroupToCIFSWrapper.getWrappedInstance().show({
            localAuthUserGroupListOfCIFS,
            share,
            notDirectlyCreate: false
        });
    }

    async show (share){
        await this.setState({
            visible: true,
            share,
            loadingList: true,
            localAuthUserOrGroupListOfCIFS: [],
            localAuthUserOrGroupListOfCIFSBackup: [],
        });
        await httpRequests.getLocalAuthUserOrGroupListByCIFSShareName(share.name);
        this.setState({loadingList: false});
    }

    hide (){
        // reset client list to an empty array
        this.setState({visible: false});
        this.props.setLocalAuthUserOrGroupListOfCIFS([]);
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {share, loadingList, localAuthUserOrGroupListOfCIFS} = this.state;
        let typeMap = {
            'local_user': lang('本地认证用户', 'Local Authentication User'),
            'local_group': lang('本地认证用户组', 'Local Authentication User Group'),
        };
        let permissionMap = {
            'full-control': lang('完全控制', 'Full control'),
            'read_and_write': lang('读写', 'Read and write'),
            'readonly': lang('只读', 'Readonly'),
            'forbidden': lang('禁止', 'Forbidden'),
        };
        let tableProps = {
            size: 'small',
            dataSource: localAuthUserOrGroupListOfCIFS,
            loading: {
                spinning: loadingList,
                indicator: <Icon type="loading" />
            },
            pagination: {
                size: 'normal',
                pageSize: 10,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: record => `${record.type}-${record.name}`,
            locale: {
                emptyText: lang('该CIFS共享暂无用户/用户组，请先添加', 'No user/group user for this CIFS share, please create')
            },
            title: () => (
                <div>
                    <Input.Search
                        style={{width: 170}}
                        size="small"
                        placeholder={lang('名称', 'Name')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <Button
                        size="small"
                        type="primary"
                        style={{float: 'right'}}
                        onClick={this.showAddGroup.bind(this)}
                    >
                        {lang('添加用户组', 'Add User Group')}
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        style={{float: 'right', marginRight: 10}}
                        onClick={this.showAddUser.bind(this)}
                    >
                        {lang('添加用户', 'Add User')}
                    </Button>
                </div>
            ),
            columns: [
                {title: lang('名称', 'Name'), width: 140, dataIndex: 'name',},
                {title: lang('类型', 'Type'), width: 200, dataIndex: 'type',
                    render: text => typeMap[text]
                },
                {title: lang('权限', 'Permission'), width: 130, dataIndex: 'permission',
                    render: text => permissionMap[text]
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
                            <Popover {...buttonPopoverConf} content={lang('移除', 'Delete')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.remove.bind(this, record, index)}
                                    icon="delete"
                                />
                            </Popover>
                        </div>;
                    }
                }
            ],
        };
        return (
            <Modal
                title={lang(`CIFS共享 ${share.name} 的用户/用户组信息`, `User/User Group Of CIFS Share ${share.name}`)}
                width={600}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                    </div>
                }
            >
                <Table {...tableProps} />
                <EditUserOrGroupOfCIFS ref={ref => this.editUserOrGroupOfCIFSWrapper =ref} />
                <AddLocalAuthUserToCIFS ref={ref => this.addLocalAuthUserToCIFSWrapper =ref} />
                <AddLocalAuthUserGroupToCIFS ref={ref => this.addLocalAuthUserGroupToCIFSWrapper =ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {share: {localAuthUserOrGroupListOfCIFS}}} = state;
    return {language, localAuthUserOrGroupListOfCIFS};
};

const mapDispatchToProps = dispatch => {
    return {
        setLocalAuthUserOrGroupListOfCIFS: clientList => dispatch(shareAction.setLocalAuthUserOrGroupListOfCIFS(clientList)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(UserOrGroupOfCIFS);