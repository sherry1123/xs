import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Input, message, Modal, Table} from "antd";
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class SelectLocalAuthUserGroup extends Component {
    constructor (props){
        super(props);
        let {localAuthUserGroupList} = this.props;
        this.state = {
            visible: false,
            multipleSelect: false,
            selectedLocalAuthUserGroups: [],
            localAuthUserGroupList,
            localAuthUserGroupListBackup: localAuthUserGroupList,
        };
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

    async show (multipleSelect){
        let {localAuthUserGroupList} = this.props;
        if (!localAuthUserGroupList.length){
            httpRequests.getLocalAuthUserGroupList();
        }
        await this.setState({
            visible: true,
            multipleSelect,
            selectedLocalAuthUserGroups: [],
            localAuthUserGroupList,
            localAuthUserGroupListBackup: localAuthUserGroupList,
        });
    }

    add (){
        let {multipleSelect, selectedLocalAuthUserGroups} = this.state;
        if (!multipleSelect && selectedLocalAuthUserGroups.length > 1){
            return message.warning(lang('主组只能选择一个', 'Primary group can only select one'));
        }
        this.props.onSelectGroup && this.props.onSelectGroup({
            type: multipleSelect ? 'secondaryGroup' : 'primaryGroup',
            groupNames: [...selectedLocalAuthUserGroups],
        });
        this.hide();
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let {selectedLocalAuthUserGroups, localAuthUserGroupList} = this.state;
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
                emptyText: lang('暂无本地认证用户组', 'No local authentication user group')
            },
            rowClassName: () => 'ellipsis',
            rowSelection: {
                columnWidth: '5%',
                selectedRowKeys: selectedLocalAuthUserGroups,
                onChange: selectedRowKeys => this.setState({selectedLocalAuthUserGroups: selectedRowKeys}),
                getCheckboxProps: record => ({
                    disabled: record.deleting || record.rollbacking
                }),
            },
            title: () => (
                <div>
                    <Input.Search
                        style={{width: 170}}
                        className="fs-search-table-input"
                        size="small"
                        placeholder={lang('用户组名称', 'Group Name')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                </div>
            ),
            columns: [
                {title: lang('名称', 'Name'), width: 200, dataIndex: 'name',},
                {title: lang('描述', 'Description'), width: 200, dataIndex: 'description',
                    render: text => text || '--'
                },
            ],
        };
        return (
            <Modal
                title={lang(`选择用户组`, `Select Local Authentication User Group`)}
                width={600}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.add.bind(this)}
                        >
                            {lang('确定', 'Ok')}
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
    let {language, main: {localAuthUser: {localAuthUserGroupList}}} = state;
    return {language, localAuthUserGroupList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SelectLocalAuthUserGroup);