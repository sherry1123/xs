import React, {Component} from 'react';
import {connect} from 'react-redux';
import shareAction from 'Actions/shareAction';
import {Button, Icon, Input, message, Modal, Popover, Table} from 'antd';
import CreateClientToNFS from './CreateClientToNFS';
import EditClient from './EditClient';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class ClientOfNFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            path: '',
            query: '',
            loadingList: true,
            clientListOfNFS: [],
            clientListOfNFSBackup: [],
        };
    }

    async componentWillReceiveProps (nextProps){
        let {clientListOfNFS} = nextProps;
        await this.setState({clientListOfNFS, clientListOfNFSBackup: clientListOfNFS});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                clientListOfNFS: [...this.state.clientListOfNFSBackup].filter(({ip = ''}) => ip.match(query))
            });
        } else {
            this.setState({clientListOfNFS: this.state.clientListOfNFSBackup});
        }
    }

    create (){
        this.createClientToNFSWrapper.getWrappedInstance().show({
            clientListOfNFS: [...this.state.clientListOfNFS],
            path: this.state.path,
            notDirectlyCreate: false
        });
    }

    edit (client){
        this.editClientWrapper.getWrappedInstance().show({
            client: client,
            path: this.state.path,
        });
    }

    delete (client, index){
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除客户端 ${client.ip} 的操作。`, `You are about to delete client ${client.ip}`)}</p>
                <p>{lang(`该操作将导致正在使用该客户端访问的业务中断。`, `This operation will interrupt services that are being accessed through this client.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保无任何业务运行在该客户端上。`, `A suggestion: before deleting this client, ensure that there's no service is running on this share.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    client = Object.assign({}, client, {path: this.state.path});
                    await httpRequests.deleteClientInNFSShare(client);
                    let clientListOfNFS = Object.assign([], this.state.clientListOfNFS);
                    clientListOfNFS.splice(index, 1);
                    this.setState({clientListOfNFS});
                    message.success(lang(`删除客户端 ${client.ip} 成功!`, `Delete client ${client.ip} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除客户端 ${client.ip} 失败, 原因: `, `Delete client ${client.ip} failed, reason: `) + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    async show (path){
        await this.setState({
            visible: true,
            path,
            query: '',
            loadingList: true,
            clientListOfNFS: [],
            clientListOfNFSBackup: [],
        });
        await httpRequests.getClientListByNFSSharePath(path);
        this.setState({loadingList: false});
    }

    hide (){
        // reset client list to an empty array
        this.setState({visible: false});
        this.props.setClientListOfNFS([]);
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {path, loadingList, clientListOfNFS} = this.state;
        let typeMap = {
            host: lang('主机或IP', 'host or IP')
        };
        let permissionMap = {
            'readonly': lang('只读', 'Readonly'),
            'read_and_write_n': lang('读写(不支持删除和重命名)', 'Read-write(not support delete and rename)'),
            'read_and_write': lang('读写', 'Read-write')
        };
        let tableProps = {
            size: 'small',
            dataSource: clientListOfNFS,
            loading: {
                spinning: loadingList,
                indicator: <Icon type="loading" />
            },
            pagination: {
                size: 'normal',
                pageSize: 10,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'ip',
            locale: {
                emptyText: lang('该NFS共享暂无客户端，请先添加', 'No client for this NFS share, please create')
            },
            title: () => (
                <div>
                    <Input.Search
                        style={{width: 170}}
                        size="small"
                        placeholder={lang('客户端名称', 'Client Name')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <Button
                        size="small"
                        type="primary"
                        style={{float: 'right'}}
                        onClick={this.create.bind(this)}
                    >
                        {lang('创建', 'Create')}
                    </Button>
                </div>
            ),
            columns: [
                {title: lang('名称', 'Name'), width: 140, dataIndex: 'ip',},
                {title: lang('类型', 'Type'), width: 70, dataIndex: 'type',
                    render: text => typeMap[text]
                },
                {title: lang('权限', 'Permission'), width: 160, dataIndex: 'permission',
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
                title={lang(`NFS共享 ${path} 的客户端信息`, `Client Information Of NFS Share ${path}`)}
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
                <CreateClientToNFS ref={ref => this.createClientToNFSWrapper = ref} />
                <EditClient ref={ref => this.editClientWrapper = ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {share: {clientListOfNFS}}} = state;
    return {language, clientListOfNFS};
};

const mapDispatchToProps = dispatch => {
    return {
        setClientListOfNFS: clientList => dispatch(shareAction.setClientListOfNFS(clientList)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(ClientOfNFS);