import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Modal, Popover, Table} from 'antd';
import CreateCIFS from './CreateCIFS';
import EditCIFS from './EditCIFS';
import UserOrGroupOfCIFS from './UserOrGroupOfCIFS';
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class CIFS extends Component {
    constructor (props){
        super(props);
        let {CIFSList} = this.props;
        this.state = {
            // table
            query: '',
            CIFSList,
            CIFSListBackup: CIFSList,
            // table items batch delete
            batchDeleteNames: [],
        };
    }

    componentDidMount (){
        httpRequests.getCIFSShareList();
    }

    async componentWillReceiveProps (nextProps){
        let {CIFSList} = nextProps;
        await this.setState({CIFSList, CIFSListBackup: CIFSList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                CIFSList: [...this.state.CIFSListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({NFSList: this.state.CIFSListBackup});
        }
    }

    create (){
        this.createCIFSWrapper.getWrappedInstance().show();
    }

    edit (CIFSShare){
        this.editCIFSWrapper.getWrappedInstance().show(CIFSShare);
    }

    userOrGroup (CIFSShare){
        this.userOrGroupOfCIFSWrapper.getWrappedInstance().show(CIFSShare.name);
    }

    delete (shareData, index){
        let {name} = shareData;
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除CIFS共享 ${name} 的操作。`, `You are about to delete CIFS share ${name}`)}</p>
                <p>{lang(`该操作将导致共享不可用，并且断开正在访问该共享目录的用户的连接。`, `This operation will make the share unavailable and interrupt the connections of the users to this directory.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保无任何业务运行在该共享上。`, `A suggestion: before deleting this share, ensure that there's no service is running on this share.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteCIFSShare(shareData);
                    let CIFSList = Object.assign([], this.state.CIFSList);
                    CIFSList.splice(index, 1);
                    this.setState({CIFSList});
                    message.success(lang(`删除CIFS共享 ${name} 成功!`, `Delete CIFS share ${name} successfully!`));
                } catch ({msg}){
                    message.error(lang(`删除CIFS共享 ${name} 失败, 原因: `, `Delete CIFS share ${name} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    batchDelete (){
        let {batchDeleteNames} = this.state;
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除这 ${batchDeleteNames.length} 个CIFS共享的操作。`, `You are about to delete these ${batchDeleteNames.length} CIFS share(s).`)}</p>
                <p>{lang(`该操作将导致这些共享不可用，并且断开正在访问这些共享目录的用户的连接。`, `This operation will make these shares unavailable and interrupt the connections of the users to these directories.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保无任何业务运行在这些共享上。`, `A suggestion: before deleting this share, ensure that there's no service is running on these shares.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteCIFSShareInBatch(batchDeleteNames);
                    httpRequests.getCIFSShareList();
                    message.success(lang('批量删除CIFS共享成功！', 'Delete CIFS shares in batch successfully!'));
                } catch ({msg}){
                    message.error(lang('批量删除CIFS共享失败，原因：', 'Delete CIFS shares in batch failed, reason: ') + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {batchDeleteNames, CIFSList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: CIFSList,
            pagination: 'normal',
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无CIFS共享', 'No CIFS Share')
            },
            rowSelection: {
                columnWidth: '2.5%',
                selectedRowKeys: batchDeleteNames,
                onChange: selectedRowKeys => this.setState({batchDeleteNames: selectedRowKeys}),
            },
            title: () => (<span className="fs-table-title"><Icon type="folder" />{lang('CIFS共享', 'CIFS Share')} (Windows/MAC)</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('共享名称', 'Share Name'), width: 200, dataIndex: 'name',},
                {title: lang('共享路径', 'Share Path'), width: 200, dataIndex: 'path',},
                {title: lang('描述', 'Description'), width: 200, dataIndex: 'description',
                    render: text => !text ? '--' : text
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return <div>
                            <Popover {...buttonPopoverConf} content={lang('用户/用户组', 'User')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.userOrGroup.bind(this, record)}
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
                        placeholder={lang('CIFS共享名称', 'CIFS share Name')}
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
                    <Table clasName="" {...tableProps} />
                </div>
                <CreateCIFS ref={ref => this.createCIFSWrapper = ref} />
                <EditCIFS ref={ref => this.editCIFSWrapper = ref} />
                <UserOrGroupOfCIFS ref={ref => this.userOrGroupOfCIFSWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {share: {CIFSList}}} = state;
    return {language, CIFSList};
};

export default connect(mapStateToProps)(CIFS);