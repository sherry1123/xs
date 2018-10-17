import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Icon, Input, Table, Popover, Modal, message} from 'antd';
import CreateNASServer from './CreateNASServer';
import EditNASServer from './EditNASServer';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    const {language, main: {share: {NASServerList, NFSList, CIFSList}}} = state;
    return {language, NASServerList, NFSList, CIFSList};
};

@connect(mapStateToProps)
export default class NASServer extends Component {
    constructor (props){
        super(props);
        let {NASServerList} = this.props;
        this.state = {
            // table
            query: '',
            dataPreparing: true,
            NASServerList,
            NASServerListBackup: NASServerList,
            // table items batch delete
            batchDeleteNames: [],
        };
    }

    async componentDidMount (){
        httpRequests.getNASServerList();
        let {NFSList, CIFSList} = this.props;
        if (!NFSList.length){
            await httpRequests.getNFSShareList();
        }
        if (!CIFSList.length){
            await httpRequests.getCIFSShareList();
        }
        this.setState({dataPreparing: false});
    }

    async componentWillReceiveProps (nextProps){
        let {NASServerList} = nextProps;
        await this.setState({NASServerList, NASServerListBackup: NASServerList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                NASServerList: [...this.state.NASServerListBackup].filter(({ip = ''}) => ip.match(query))
            });
        } else {
            this.setState({NASServerList: this.state.NASServerListBackup});
        }
    }

    create (){
        this.createNASServerWrapper.getWrappedInstance().show();
    }

    edit (NASServerData){
        this.editNASServerWrapper.getWrappedInstance().show(NASServerData);
    }

    delete (NASServer, index){
        let {NFSList, CIFSList} = this.props;
        let {path: NASServerPath} = NASServer;
        // if a NAS server has any NFS or CIFS share inside, it can't be deleted.
        if (
            NFSList.some(({path}) => path.match(NASServerPath) && path.match(NASServerPath).index === 0) ||
            CIFSList.some(({path}) => path.match(NASServerPath) && path.match(NASServerPath).index === 0)
        ){
            return message.warning(lang(`NAS服务器 ${NASServer.path}@${NASServer.ip} 含有NFS或者CIFS共享，无法被删除！`, `NAS server ${NASServer.path}@${NASServer.ip} has NFS or CIFS share inside, it can't be deleted!`));
        }

        const modal = Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行删除NAS服务器 ${NASServer.path}@${NASServer.ip} 的操作。`, `You are about to delete NAS server ${NASServer.path}@${NASServer.ip}.`)}</p>
				<p>{lang(`该操作将会从系统中移除NAS服务器 ${NASServer.path}@${NASServer.ip}。`, `This operation will delete NAS server ${NASServer.path}@${NASServer.ip} from the system. `)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的NAS服务器，并确认它已不再需要。`, `A suggestion: before executing this operation, ensure that you select the right NAS server and it's no longer necessary.`)}</p>
			</div>,
			keyboard: false,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
				try {
					await httpRequests.deleteNASServer(NASServer);
					let NASServerList = Object.assign([], this.state.NASServerList);
					NASServerList.splice(index, 1);
					this.setState({NASServerList});
					message.success(lang(`NAS服务器 ${NASServer.path}@${NASServer.ip} 删除成功!`, `Delete NAS server ${NASServer.path}@${NASServer.ip} successfully!`));
					httpRequests.getNASServerList();
				} catch ({msg}){
					message.error(lang(`删除NAS 服务器 ${NASServer.path}@${NASServer.ip} 失败, 原因: `, `Delete NAS server ${NASServer.path}@${NASServer.ip} failed, reason: `) + msg);
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
        let {NASServerList, dataPreparing} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: NASServerList,
            pagination: NASServerList.length > 12 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items`
                ),
                size: 'normal'
            },
            rowKey: 'path',
            locale: {
                emptyText: lang('暂无NAS服务器', 'No NAS Server')
            },
            title: () => (<span className="fs-table-title"><Icon type="desktop" />{lang('NAS服务器', 'NAS Server')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('IP', 'IP'), width: 200, dataIndex: 'ip',},
                {title: lang('管理路径', 'Manage Path'), width: 200, dataIndex: 'path',},
                {title: lang('描述', 'Description'), width: 200, dataIndex: 'description',
                    render: text => text || '--'
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return  <div>
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
                                    disabled={dataPreparing}
                                    onClick={this.delete.bind(this, record, index)}
                                    icon="delete"
                                />
                            </Popover>
                        </div>
                    }
                }
            ],
        };
        return (
            <div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <Input.Search
                        size="small"
                        placeholder={lang('NAS服务器IP', 'NAS Server IP')}
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
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <CreateNASServer ref={ref => this.createNASServerWrapper = ref} />
                <EditNASServer ref={ref => this.editNASServerWrapper = ref} />
            </div>
        );
    }
}