import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, Table} from 'antd';
import CreateNASServer from './CreateNASServer';
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
        httpRequests.getNFSShareList();
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

    render (){
        let {NASServerList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: NASServerList,
            pagination: 'normal',
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
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {share: {NASServerList}}} = state;
    return {language, NASServerList};
};

export default connect(mapStateToProps)(NASServer);