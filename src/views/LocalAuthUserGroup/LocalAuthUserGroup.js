import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Popover, Modal, Table} from 'antd';
import CreateLocalAuthUserGroup from './CreateLocalAuthUserGroup';
import EditLocalAuthUserGroup from './EditLocalAuthUserGroup';
import LocalAuthUserOfGroup from './LocalAuthUserOfGroup';
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class LocalAuthUserGroup extends Component {
    constructor (props){
        super(props);
        let {localAuthUserGroupList} = this.props;
        this.state = {
            // table
            query: '',
            localAuthUserGroupList,
            localAuthUserGroupListBackup: localAuthUserGroupList,
        };
    }

    componentDidMount (){
        httpRequests.getLocalAuthUserGroupList();
    }

    async componentWillReceiveProps (nextProps){
        let {localAuthUserGroupList} = nextProps;
        await this.setState({localAuthUserGroupList, localAuthUserGroupListBackup: localAuthUserGroupList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                localAuthUserGroupList: [...this.state.localAuthUserGroupListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({localAuthUserGroupList: this.state.localAuthUserGroupListBackup});
        }
    }

    user ({name}){
        this.localAuthUserOfGroupWrapper.getWrappedInstance().show(name);
    }

    create (){
        this.createLocalAuthUserGroupWrapper.getWrappedInstance().show();
    }

    edit (groupData){
        this.editLocalAuthUserGroupWrapper.getWrappedInstance().show(groupData);
    }

    delete (groupData, index){
        let {name} = groupData;
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除本地认证用户组 ${name} 的操作。`, `You are about to delete NFS share ${name}`)}</p>
                <p>{lang(`该操作将导致该用户组中的用户无法继续访问共享数据，业务中断。`, `This operation will make the users in the user group cannot access shared data and related services are interrupted.
Before performing this operation.`)}</p>
                <p>{lang(`建议：执行该操作前请确认您选择的本地认证用户组是否正确，并确认它不再需要。`, `A suggestion: before deleting this group, ensure that the selected user group is no longer necessary..`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteLocalAuthUserGroup(groupData);
                    let localAuthUserGroupList = Object.assign([], this.state.localAuthUserGroupList);
                    localAuthUserGroupList.splice(index, 1);
                    this.setState({localAuthUserGroupList});
                    message.success(lang(`删除本地认证用户组 ${name} 成功!`, `Delete local authentication group ${name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除本地认证用户组 ${name} 失败, 原因: `, `Delete local authentication group ${name} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {localAuthUserGroupList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: localAuthUserGroupList,
            pagination: 'normal',
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无本地认证用户组', 'No local authentication user group')
            },
            title: () => (<span className="fs-table-title"><Icon type="user-group-add" />{lang('本地认证用户组', 'Local Authentication User Group')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('名称', 'Name'), width: 140, dataIndex: 'name',},
                {title: lang('描述', 'Description'), width: '50%', dataIndex: 'description',
                    render: text => text || '--'
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return <div>
                            <Popover {...buttonPopoverConf} content={lang('本地认证用户', 'Local Authentication User')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.user.bind(this, record)}
                                    icon="user"
                                />
                            </Popover>
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
                        placeholder={lang('名称', 'Name')}
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
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <CreateLocalAuthUserGroup ref={ref => this.createLocalAuthUserGroupWrapper = ref} />
                <EditLocalAuthUserGroup ref={ref => this.editLocalAuthUserGroupWrapper = ref} />
                <LocalAuthUserOfGroup ref={ref => this.localAuthUserOfGroupWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {localAuthUser: {localAuthUserGroupList}}} = state;
    return {language, localAuthUserGroupList};
};

export default connect(mapStateToProps)(LocalAuthUserGroup);