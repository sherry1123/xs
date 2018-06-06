import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, Modal, Table} from 'antd';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';

class SelectClient extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            loadingList: true,
            clientListForNASServer: [],
            clientListForNASServerBackup: [],
            selectedClientIPs: [],
        };
    }

    async componentWillReceiveProps (nextProps){
        let {clientListForNASServer} = nextProps;
        await this.setState({clientListForNASServer, clientListForNASServerBackup: clientListForNASServer});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                clientListForNASServer: [...this.state.clientListForNASServerBackup].filter(({ip = '', hostname = ''}) => ip.match(query) || hostname.match(query))
            });
        } else {
            this.setState({clientListForNASServer: this.state.clientListForNASServerBackup});
        }
    }

    outputClientIP (){
        let {onSelect} = this.props;
        (typeof onSelect === 'function') && onSelect(this.state.selectedClientIPs[0]);
        this.hide();
    }

    async show (){
        await this.setState({
            visible: true,
            loadingList: true,
            clientListForNASServer: [],
            clientListForNASServerBackup: [],
            selectedClientIPs: [],
        });
        await httpRequests.getClientListForNASServer();
        this.setState({loadingList: false});
    }

    hide (){
        this.setState({visible: false,});
    }

    render (){
        let {loadingList, clientListForNASServer, selectedClientIPs,} = this.state;
        let tableProps = {
            size: 'small',
            dataSource: clientListForNASServer,
            loading: {
                spinning: loadingList,
                indicator: <Icon type="loading" />
            },
            locale: {
                emptyText: lang('暂无客户端', 'No Client')
            },
            pagination: {
                size: 'normal',
                pageSize: 5,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowSelection: {
                columnWidth: '30px',
                selectedRowKeys: selectedClientIPs,
                getCheckboxProps: record => ({disabled: record.isUsed,}),
                onChange: selectedRowKeys => this.setState({selectedClientIPs: selectedRowKeys}),
            },
            rowKey: 'ip',
            rowClassName: () => 'ellipsis',
            title: () => (
                <div>
                    <Input.Search
                        style={{width: 150}}
                        className="fs-search-table-input"
                        size="small"
                        placeholder={lang('客户端主机名/IP', 'Client Hostname/IP')}
                        value={this.state.query}
                        onChange={this.queryChange.bind(this)}
                        onSearch={this.searchInTable.bind(this)}
                    />
                    <span style={{float: 'right', marginTop: 8, fontSize: 12,}}>{lang('选择1个客户端来运行NAS服务器', 'Select 1 client to run NAS server')}</span>
                </div>
            ),
            columns: [
                {title: lang('主机名', 'Hostname'), width: 150, dataIndex: 'hostname',},
                {title: lang('IP', 'IP'), width: 150, dataIndex: 'ip',},
                {title: lang('状态', 'Status'), width: 100, dataIndex: 'isUsed',
                    render: text => text ? lang('已使用', 'Used') : lang('未使用', 'Not Used')
                }
            ],
        };
        return (
            <Modal
                title={lang(`选择客户端`, `Select Client`)}
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
                        <Button
                            size="small"
                            type="primary"
                            disabled={selectedClientIPs.length !== 1}
                            onClick={this.outputClientIP.bind(this)}
                        >
                            {lang('确定', 'Ok')}
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
    let {language, main: {share: {clientListForNASServer}, target: {targetList}}} = state;
    return {language, clientListForNASServer, targetList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SelectClient);