import React, {Component} from 'react';
import {connect} from 'react-redux';
import localAuthUserAction from '../../redux/actions/localAuthUserAction';
import {Button, Icon, Input, message, Modal, Popover, Table} from 'antd';
import AddLocalAuthUserToGroup from './AddLocalAuthUserToGroup';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language, main: {localAuthUser: {localAuthUserListOfGroup}}} = state;
    return {language, localAuthUserListOfGroup};
};

const mapDispatchToProps = dispatch => ({
    setLocalAuthUserListOfGroup: localAuthUserListOfGroup => dispatch(localAuthUserAction.setLocalAuthUserListOfGroup(localAuthUserListOfGroup)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
export default class LocalAuthUserOfGroup extends Component {
    constructor (props){
        super(props);
        let {localAuthUserListOfGroup} = this.props;
        this.state = {
            visible: false,
            groupName: '',
            loadingList: true,
            query: '',
            localAuthUserListOfGroup,
            localAuthUserListOfGroupBackup: localAuthUserListOfGroup,
        };
    }

    async componentWillReceiveProps (nextProps){
        let {localAuthUserListOfGroup} = nextProps;
        await this.setState({localAuthUserListOfGroup, localAuthUserListOfGroupBackup: localAuthUserListOfGroup});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                localAuthUserListOfGroup: [...this.state.localAuthUserListOfGroupBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({localAuthUserListOfGroup: this.state.localAuthUserListOfGroupBackup});
        }
    }

    add (){
        let {groupName, localAuthUserListOfGroup} = this.state;
        this.addLocalAuthUserToGroupWrapper.getWrappedInstance().show({
            groupName,
            localAuthUserListOfGroup
        });
    }

    remove (user, index){
        if (!user.secondaryGroup.length){
            return message.warning(lang('不能将用户从所在主组中移除！', 'Can\'t remove user from its primary group!'));
        }
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行移除本地认证用户 ${user.name} 的操作。`, `You are about to remove local authentication user ${user.name}.`)}</p>
                <p>{lang(`该操作将导致该用户无法继续访问共享数据，业务中断。`, `This operation will make the user no longer be able to access shared data and related services are interrupted..`)}</p>
                <p>{lang(`建议：执行该操作前请确认您选择的本地认证用户是否正确，并确认它不再需要。`, `A suggestion: before removing the user ensure that the selected user is no longer necessary.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    user = Object.assign({}, user, {groupName: this.state.groupName});
                    await httpRequests.removeLocalAuthUserFromGtoup(user);
                    let localAuthUserListOfGroup = Object.assign([], this.state.localAuthUserListOfGroup);
                    localAuthUserListOfGroup.splice(index, 1);
                    this.setState({localAuthUserListOfGroup});
                    message.success(lang(`移除本地认证用户 ${user.name} 成功!`, `Remove local authentication user ${user.name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`移除本地认证用户 ${user.name} 失败, 原因: `, `Remove local authentication user ${user.name} failed, reason: `) + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    async show (groupName){
        let {localAuthUserListOfGroup} = this.props;
        await this.setState({
            visible: true,
            groupName,
            loadingList: true,
            query: '',
            localAuthUserListOfGroup,
            localAuthUserListOfGroupBackup: localAuthUserListOfGroup,
        });
        await httpRequests.getLocalAuthUserListByGroupName(groupName);
        this.setState({loadingList: false});
    }

    hide (){
        // reset local auth user list to an empty array
        this.setState({visible: false});
        this.props.setLocalAuthUserListOfGroup([]);
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {groupName, loadingList, localAuthUserListOfGroup} = this.state;
        let tableProps = {
            size: 'small',
            dataSource: localAuthUserListOfGroup,
            loading: {
                spinning: loadingList,
                indicator: <Icon type="loading" />
            },
            pagination: {
                size: 'normal',
                pageSize: 10,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('该组暂无本地认证用户', 'No local authentication in this group')
            },
            rowClassName: () => 'ellipsis',
            title: () => (
                <div>
                    <Input.Search
                        style={{width: 170}}
                        size="small"
                        placeholder={lang('用户名称', 'User Name')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <Button
                        size="small"
                        type="primary"
                        style={{float: 'right'}}
                        onClick={this.add.bind(this)}
                    >
                        {lang('添加用户', 'Add User')}
                    </Button>
                </div>
            ),
            columns: [
                {title: lang('名称', 'Name'), width: 120, dataIndex: 'name',},
                {title: lang('状态', 'Status'), width: 60, dataIndex: 'type',
                    render: () => lang('正常', 'Normal')
                },
                {title: lang('主组', 'Primary Group'), width: 120, dataIndex: 'primaryGroup',},
                {title: lang('附属组', 'Secondary Group'), width: 180, dataIndex: 'secondaryGroup',
                    render: text => !text.length ? '--' : text.join(',')
                },
                {title: lang('描述', 'Description'), width: 180, dataIndex: 'description',
                    render: text => !text ? '--' : text
                },
                {title: lang('操作', 'Operations'), width: 60,
                    render: (text, record, index) => {
                        return <div>
                            <Popover {...buttonPopoverConf} content={lang('移除', 'Remove')}>
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
                title={lang(`本地认证用户组 ${groupName} 的用户信息`, `Local Authentication User Group ${groupName}`)}
                width={800}
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
                <AddLocalAuthUserToGroup ref={ref => this.addLocalAuthUserToGroupWrapper = ref} />
            </Modal>
        );
    }
}