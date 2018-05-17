import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Input, message, Modal, Table} from "antd";
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class AddLocalAuthUserToGroup extends Component {
    constructor (props){
        super(props);
        let {localAuthUserList} = this.props;
        this.state = {
            visible: false,
            groupName: '',
            formSubmitting: false,
            localAuthUserListOfGroup: [],
            selectedLocalAuthUsers: [],
            localAuthUserList,
            localAuthUserListBackup: localAuthUserList,
        };
    }

    async componentWillReceiveProps (nextProps){
        let {localAuthUserList} = nextProps;
        // filter out the users that are already in this group
        localAuthUserList = this.filterOutExistedLocalAuthUserInGroup(this.state.localAuthUserListOfGroup, localAuthUserList);
        await this.setState({localAuthUserList, localAuthUserListBackup: localAuthUserList});
        await this.searchInTable(this.state.query, true);
    }

    filterOutExistedLocalAuthUserInGroup (localAuthUserListOfGroup, localAuthUserList){
        let localAuthUserNamesOfGroup = localAuthUserListOfGroup.map(user => user.name);
        localAuthUserList = localAuthUserList.filter(user => !localAuthUserNamesOfGroup.includes(user.name));
        return localAuthUserList;
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

    async add (){
        let {groupName, selectedLocalAuthUsers} = this.state;
        this.setState({formSubmitting: true});
        try {
            await httpRequests.addLocalAuthUserToGroup(groupName, selectedLocalAuthUsers);
            httpRequests.getLocalAuthUserListByGroupName(this.state.groupName);
            await this.hide();
            message.success(lang(`为本地认证用户组 ${groupName} 添加本地认证用户成功!`, `Add local authentication user(s) to local authentication user group ${groupName} successfully!`));
        } catch ({msg}){
            message.error(lang(`为本地认证用户组 ${groupName} 添加本地认证用户失败, 原因: `, `Add local authentication user(s) to local authentication user group ${groupName} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    async show ({groupName, localAuthUserListOfGroup}){
        let {localAuthUserList} = this.props;
        if (!localAuthUserList.length){
            httpRequests.getLocalAuthUserList();
        }
        localAuthUserList = this.filterOutExistedLocalAuthUserInGroup(localAuthUserListOfGroup, localAuthUserList);
        await this.setState({
            visible: true,
            groupName,
            formSubmitting: false,
            localAuthUserListOfGroup,
            selectedLocalAuthUsers: [],
            localAuthUserList,
            localAuthUserListBackup: localAuthUserList,
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let {formSubmitting, selectedLocalAuthUsers, localAuthUserList} = this.state;
        let tableProps = {
            size: 'small',
            dataSource: localAuthUserList,
            pagination: {
                size: 'normal',
                pageSize: 10,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无本地认证用户，请先到本地认证用户页面进行创建', 'No local authentication user, please go that page to create')
            },
            rowSelection: {
                columnWidth: '2%',
                selectedRowKeys: selectedLocalAuthUsers,
                onChange: selectedRowKeys => this.setState({selectedLocalAuthUsers: selectedRowKeys}),
            },
            rowClassName: () => 'ellipsis',
            title: () => (
                <div>
                    <Input.Search
                        style={{width: 170}}
                        className="fs-search-table-input"
                        size="small"
                        placeholder={lang('用户名称', 'User Name')}
                        value={this.state.query}
                        enterButton={true}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                </div>
            ),
            columns: [
                {title: lang('名称', 'Name'), width: 120, dataIndex: 'name',},
                {title: lang('状态', 'Status'), width: 70, dataIndex: 'type',
                    render: () => lang('正常', 'Normal')
                },
                {title: lang('主组', 'Primary Group'), width: 120, dataIndex: 'primaryGroup',},
                /*
                {title: lang('附属组', 'Secondary Group'), width: 250, dataIndex: 'secondaryGroup',
                    render: text => !text.length ? '--' : text.join(',')
                },
                */
                {title: lang('描述', 'Description'), width: 180, dataIndex: 'description',
                    render: text => !text ? '--' : text
                },
            ],
        };
        return (
            <Modal
                title={lang(`添加本地认证用户`, `Add Local Authentication User`)}
                width={700}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            disabled={!selectedLocalAuthUsers.length}
                            loading={formSubmitting}
                            onClick={this.add.bind(this)}
                        >
                            {lang('添加', 'Add')}
                        </Button>
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
            </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(AddLocalAuthUserToGroup);