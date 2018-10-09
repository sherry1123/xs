import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Modal, Popover, Select, Table} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class AddLocalAuthUserGroupToCIFS extends Component {
    constructor (props){
        super(props);
        let {localAuthUserGroupList} = this.props;
        this.state = {
            visible: false,
            notDirectlyCreate: false,
            formSubmitting: false,
            share: {},
            localAuthUserGroupListOfCIFS: [],
            permission: 'readonly',
            selectedLocalAuthUserGroups: [],
            localAuthUserGroupList,
            localAuthUserGroupListBackup: localAuthUserGroupList,
        };
    }

    async componentWillReceiveProps (nextProps){
        let {localAuthUserGroupList} = nextProps;
        // filter out the users that are already in this group
        localAuthUserGroupList = this.filterOutExistedLocalAuthUserInCIFS(this.state.localAuthUserGroupListOfCIFS, localAuthUserGroupList);
        await this.setState({localAuthUserGroupList, localAuthUserGroupListBackup: localAuthUserGroupList});
        await this.searchInTable(this.state.query, true);
    }

    filterOutExistedLocalAuthUserInCIFS (localAuthUserGroupListOfCIFS, localAuthUserGroupList){
        let localAuthUserNamesOfGroup = localAuthUserGroupListOfCIFS.map(user => user.name);
        localAuthUserGroupList = localAuthUserGroupList.filter(user => !localAuthUserNamesOfGroup.includes(user.name));
        return localAuthUserGroupList;
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

    async add (){
        let {notDirectlyCreate, selectedLocalAuthUserGroups, permission, share: {name: shareName, path: sharePath}} = this.state;
        if (notDirectlyCreate){
            // 创建CIFS的时候不直接添加进去
            selectedLocalAuthUserGroups = selectedLocalAuthUserGroups.map(user => ({type: 'local_group', name: user, permission, shareName, sharePath}));
            !!this.props.onAdd && this.props.onAdd(selectedLocalAuthUserGroups);
            this.hide();
        } else {
            // CIFS所属用户/用户组列表点击添加的时候直接添加进该CIFS
            this.setState({formSubmitting: true});
            try {
                let localAuthUsers = selectedLocalAuthUserGroups.map(name => ({type: 'local_group', name, permission, shareName}));
                await httpRequests.addLocalAuthUserOrGroupToCIFSShare(shareName, sharePath, localAuthUsers);
                httpRequests.getLocalAuthUserOrGroupListByCIFSShareName(shareName);
                await this.hide();
                message.success(lang(`为CIFS共享 ${shareName} 添加本地认证用户组成功!`, `Add local authentication user group for CIFS share ${shareName} successfully!`));
            } catch ({msg}){
                message.error(lang(`为CIFS共享 ${shareName} 添加本地认证用户组失败, 原因: `, `Add local authentication user group for CIFS share ${shareName} failed, reason: `) + msg);
            }
            this.setState({formSubmitting: false});
        }
    }

    async show ({notDirectlyCreate, share, localAuthUserGroupListOfCIFS}){
        let {localAuthUserGroupList} = this.props;
        if (!localAuthUserGroupList.length){
            httpRequests.getLocalAuthUserGroupList();
        }
        localAuthUserGroupList = this.filterOutExistedLocalAuthUserInCIFS(localAuthUserGroupListOfCIFS, localAuthUserGroupList);
        await this.setState({
            visible: true,
            notDirectlyCreate,
            formSubmitting: false,
            share,
            localAuthUserGroupListOfCIFS,
            selectedLocalAuthUserGroups: [],
            permission: 'readonly',
            localAuthUserGroupList,
            localAuthUserGroupListBackup: localAuthUserGroupList,
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let {formSubmitting, selectedLocalAuthUserGroups, localAuthUserGroupList} = this.state;
        let isChinese = this.props.language === 'chinese';
        let tableProps = {
            size: 'small',
            dataSource: localAuthUserGroupList,
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
                columnWidth: '5%',
                selectedRowKeys: selectedLocalAuthUserGroups,
                onChange: selectedRowKeys => this.setState({selectedLocalAuthUserGroups: selectedRowKeys}),
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
                    <div style={{float: 'right'}}>
                        {lang('请选择权限:', 'Please select permission:')}
                        <Select
                            style={{marginLeft: 10, width: isChinese ? 90 : 130}}
                            size="small"
                            value={this.state.permission}
                            onChange={value => {
                                this.setState({permission: value});
                            }}
                        >
                            {/*<Select.Option value="full-control">{lang('完全控制', 'Full control')}</Select.Option>*/}
                            <Select.Option value="read_and_write">{lang('读写', 'Read and write')}</Select.Option>
                            <Select.Option value="readonly">{lang('只读', 'Readonly')}</Select.Option>
                            <Select.Option value="forbidden">{lang('禁止', 'Forbidden')}</Select.Option>
                        </Select>
                        <Popover
                            {...buttonPopoverConf}
                            content={lang(
                                '您本次选择要加入该CIFS的所有本地认证用户组将应用此权限',
                                'The selected local authentication user groups that you want to add to this CIFS will all apply this permission at this time'
                            )}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                        </Popover>
                    </div>
                </div>
            ),
            columns: [
                {title: lang('名称', 'Name'), width: 200, dataIndex: 'name',},
                {title: lang('描述', 'Description'), width: 370, dataIndex: 'description',
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
                            disabled={this.state.formSubmitting}
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            disabled={!selectedLocalAuthUserGroups.length}
                            loading={formSubmitting}
                            onClick={this.add.bind(this)}
                        >
                            {lang('添加', 'Add')}
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
    let {language, main: {localAuthUser: {localAuthUserGroupList}}} = state;
    return {language, localAuthUserGroupList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(AddLocalAuthUserGroupToCIFS);