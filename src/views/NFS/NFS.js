import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Popover, Modal, Table} from 'antd';
import CreateNFS from './CreateNFS';
import EditNFS from './EditNFS';
import ClientOfNFS from './ClientOfNFS';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    const {language, main: {share: {NASServerList, NFSList}}} = state;
    return {language, NASServerList, NFSList};
};

@connect(mapStateToProps)
export default class NFS extends Component {
    constructor (props){
        super(props);
        let {NFSList} = this.props;
        this.state = {
            // table
            query: '',
            NFSList,
            NFSListBackup: NFSList,
            // table items batch delete
            batchDeleteNames: [],
        };
    }

    componentDidMount (){
        httpRequests.getNFSShareList();
        httpRequests.getNASServerList();
    }

    async componentWillReceiveProps (nextProps){
        let {NFSList} = nextProps;
        await this.setState({NFSList, NFSListBackup: NFSList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                NFSList: [...this.state.NFSListBackup].filter(({path = ''}) => path.match(query))
            });
        } else {
            this.setState({NFSList: this.state.NFSListBackup});
        }
    }

    client ({path}){
        this.clientOfNFSWrapper.getWrappedInstance().show(path);
    }

    create (){
        let {NASServerList} = this.props;
        if (!NASServerList.length){
            return message.warning(lang('请先创建NAS服务器！', 'Please create the NAS server first!'));
        }
        this.createNFSWrapper.getWrappedInstance().show();
    }

    edit (NFSShare){
        this.editNFSWrapper.getWrappedInstance().show(NFSShare);
    }

    delete (shareData, index){
        let {path, clientList} = shareData;
        if (!!clientList.length){
            return message.warning(lang('该NFS共享存在有客户端，无法删除！', 'This NFS share includes client(s), it can not be deleted!'));
        }
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除NFS共享 ${path} 的操作。`, `You are about to delete NFS share ${path}`)}</p>
                <p>{lang(`该操作将导致共享不可用，并且断开正在访问该共享目录的用户的连接。`, `This operation will make the share unavailable and interrupt the connections of the users to this directory.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保无任何业务运行在该共享上。`, `A suggestion: before deleting this share, ensure that there's no service is running on this share.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            okType: 'danger',
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    await httpRequests.deleteNFSShare(shareData);
                    httpRequests.getNFSShareList();
                    message.success(lang(`删除NFS共享 ${path} 成功!`, `Delete NFS share ${path} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除共享 ${path} 失败, 原因: `, `Delete NFS share ${path} failed, reason: `) + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    batchDelete (){
        let {NFSList, batchDeleteNames} = this.state;
        let shares = NFSList.reduce((prev, curr) => {
            batchDeleteNames.includes(curr.name) && prev.push(curr);
            return prev;
        }, []);
        let hasUsersOrUserGroupsShares = shares.filter(share => !!share.clientList.length);
        if (!!hasUsersOrUserGroupsShares.length){
            let shareNames = hasUsersOrUserGroupsShares.map(share => share.name).toString();
            return message.warning(lang(`NFS共享 ${shareNames} 存在有客户端，无法删除！`, `NFS share(s) ${shareNames} include(s) client(s), can not be deleted.`));
        }
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除这 ${batchDeleteNames.length} 个NFS共享的操作。`, `You are about to delete these ${batchDeleteNames.length} NFS share(s).`)}</p>
                <p>{lang(`该操作将导致这些共享不可用，并且断开正在访问这些共享目录的用户的连接。`, `This operation will make these shares unavailable and interrupt the connections of the users to these directories.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保无任何业务运行在这些共享上。`, `A suggestion: before deleting this share, ensure that there's no service is running on these shares.`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    await httpRequests.deleteNFSShareInBatch(batchDeleteNames);
                    httpRequests.getNFSShareList();
                    message.success(lang('批量删除NFS共享成功！', 'Delete NFS shares in batch successfully!'));
                } catch ({msg}){
                    message.error(lang('批量删除NFS共享失败，原因：', 'Delete NFS shares in batch failed, reason: ') + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {batchDeleteNames, NFSList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: NFSList,
            pagination: NFSList.length > 12 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items`
                ),
                size: 'normal'
            },
            rowKey: 'path',
            locale: {
                emptyText: lang('暂无NFS共享', 'No NFS Share')
            },
            rowSelection: {
                columnWidth: '2%',
                selectedRowKeys: batchDeleteNames,
                onChange: selectedRowKeys => this.setState({batchDeleteNames: selectedRowKeys}),
            },
            title: () => (<span className="fs-table-title"><Icon type="desktop" />{lang('NFS共享', 'NFS Share')} (Linux/UNIX/MAC)</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('共享路径', 'Share Path'), width: 200, dataIndex: 'path',},
                {title: lang('描述', 'Description'), width: 200, dataIndex: 'description',
                    render: text => text || '--'
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return <div>
                            <Popover {...buttonPopoverConf} content={lang('客户端', 'Client')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.client.bind(this, record)}
                                    icon="laptop"
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
                        placeholder={lang('NFS共享路径', 'NFS share path')}
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
                            size="small"
                            type="danger"
                            disabled={!this.state.batchDeleteNames.length}
                            onClick={this.batchDelete.bind(this)}
                        >
                            {lang('批量删除', 'Delete In Batch')}
                        </Button>
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <CreateNFS ref={ref => this.createNFSWrapper = ref} />
                <EditNFS ref={ref => this.editNFSWrapper = ref} />
                <ClientOfNFS ref={ref => this.clientOfNFSWrapper = ref} />
            </div>
        );
    }
}