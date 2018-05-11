import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Input, message, Popover, Table} from 'antd';
import CreateNFS from './CreateNFS';
import EditNFS from './EditNFS';
import Client from './Client';
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class NFS extends Component {
    constructor (props){
        super(props);
        let {NFSList} = this.props;
        this.state = {
            // table
            query: '',
            enableBatchDelete: false,
            NFSList,
            NFSListBackup: NFSList,
            // table items batch delete
            batchDeleteNames: [],
        };
    }

    componentDidMount (){
        httpRequests.getNFSList();
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
                NFSList: [...this.state.NFSListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({NFSList: this.state.NFSListBackup});
        }
    }

    client ({path}){
        this.clientWrapper.getWrappedInstance().show(path);
    }

    create (){
        this.createNFSWrapper.getWrappedInstance().show();
    }

    edit (NFSShare){
        this.editNFSWrapper.getWrappedInstance().show(NFSShare);
    }

    delete (){

    }


    batchDelete (){

    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {batchDeleteNames, NFSList} = this.state;
        let tableProps = {
            size: 'small',
            dataSource: NFSList,
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项，选中 ${batchDeleteNames.length} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items, selected ${batchDeleteNames.length}`
                ),
                size: 'normal',
            },
            rowKey: 'ip',
            locale: {
                emptyText: lang('暂无NFS共享', 'No NFS Share')
            },
            rowSelection: {
                columnWidth: '2%',
                selectedRowKeys: batchDeleteNames,
                onChange: (selectedRowKeys) => {
                    this.setState({batchDeleteNames: selectedRowKeys});
                },
                getCheckboxProps: record => ({
                    disabled: record.deleting || record.rollbacking
                }),
            },
            columns: [
                {title: lang('共享路径', 'Share Path'), width: 200, dataIndex: 'path',},
                {title: lang('描述', 'Description'), width: 200, dataIndex: 'description',},
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
            <div className="fs-page-content fs-snapshot-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('NFS共享', 'NFS Share')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <div className="fs-snapshot-operation-wrapper">
                            <Input.Search
                                style={{width: 170}}
                                className="fs-search-table-input"
                                size="small"
                                placeholder={lang('共享路径', 'Share Name')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button
                                className="fs-create-snapshot-button" size="small"
                                onClick={this.create.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                            <Button
                                className="fs-batch-delete-snapshot-button" size="small"
                                disabled={!this.state.batchDeleteNames.length}
                                onClick={this.batchDelete.bind(this)}
                            >
                                {lang('批量删除', 'Delete In Batch')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                    </section>
                </section>
                <CreateNFS ref={ref => this.createNFSWrapper = ref} />
                <EditNFS ref={ref => this.editNFSWrapper = ref} />
                <Client ref={ref => this.clientWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {share: {NFSList}}} = state;
    return {language, NFSList};
};

export default connect(mapStateToProps)(NFS);