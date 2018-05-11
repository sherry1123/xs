import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Icon, Input, Modal, Popover, Table} from "antd";
import CreateClient from './CreateClient';
import EditClient from './EditClient';
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class Client extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            path: '',
            loadingClient: true,
            clientList: [],
            clientListBackup: [],
            permissionMap: {
                'read-only': lang('只读', 'Readonly'),
            },
        };
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                clientList: [...this.state.clientListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({clientList: this.state.clientListBackup});
        }
    }

    create (){
        this.createClientWrapper.getWrappedInstance().show([...this.state.clientList]);
    }

    edit (){
        this.editClientWrapper.getWrappedInstance().show();
    }

    delete (){

    }

    async show (path){
        await this.setState({
            visible: true,
            path,
            loadingClient: true,
            clientList: [],
            clientListBackup: [],
        });
        let clientList = await httpRequests.getClientList(path);
        this.setState({
            loadingClient: false,
            clientList,
            clientListBackup: clientList
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {path, loadingClient, clientList} = this.state;
        let tableProps = {
            size: 'small',
            dataSource: clientList,
            loading: {
                spinning: loadingClient,
                indicator: <Icon type="loading" />
            },
            pagination: {
                size: 'normal',
                pageSize: 10,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('该NFS共享暂无客户端，请先添加', 'No client for this NFS share, please create')
            },
            title: () => (
                <div>
                    <Input.Search
                        style={{width: 170}}
                        className="fs-search-table-input"
                        size="small"
                        placeholder={lang('客户端名称', 'Client Name')}
                        value={this.state.query}
                        enterButton={true}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <Button
                        size="small"
                        style={{float: 'right'}}
                        onClick={this.create.bind(this)}
                    >
                        {lang('创建', 'Create')}
                    </Button>
                </div>
            ),
            columns: [
                {title: lang('名称', 'Name'), width: 150, dataIndex: 'ip',},
                {title: lang('类型', 'Type'), width: 100, dataIndex: 'type',},
                {title: lang('权限', 'Permission'), width: 100, dataIndex: 'permission',
                    render: text => this.state.permissionMap[text]
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
            <Modal
                title={lang(`NFS共享(${path})的客户端信息`, `Client Information Of NFS Share (${path})`)}
                width={500}
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
                <CreateClient ref={ref => this.createClientWrapper = ref} />
                <EditClient ref={ref => this.editClientWrapper = ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(Client);