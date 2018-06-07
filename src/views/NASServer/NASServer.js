import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, Table, Popover} from 'antd';
import CreateNASServer from './CreateNASServer';
import EditNASServer from './EditNASServer';
import lang from '../../components/Language/lang';
import httpRequests from "../../http/requests";

class NASServer extends Component {
    constructor (props){
        super(props);
        let {NASServerList} = this.props;
        this.state = {
            // table
            query: '',
            NASServerList,
            NASServerListBackup: NASServerList,
            // table items batch delete
            batchDeleteNames: [],
        };
    }

    componentDidMount (){
        httpRequests.getNASServerList();
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

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {NASServerList} = this.state;
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
                        return <Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
                            <Button
                                {...buttonConf}
                                onClick={this.edit.bind(this, record, index)}
                                icon="edit"
                            />
                        </Popover>;
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

const mapStateToProps = state => {
    const {language, main: {share: {NASServerList}}} = state;
    return {language, NASServerList};
};

export default connect(mapStateToProps)(NASServer);