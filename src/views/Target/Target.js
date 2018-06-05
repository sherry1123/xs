import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, Popover, Table} from 'antd';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';
import {formatStorageSize, getCapacityColour} from '../../services';

class Target extends Component {
    constructor (props){
        super(props);
        let {targetList} = this.props;
        this.state = {
            // table
            query: '',
            targetList,
            targetListBackup: targetList,
        };
    }

    componentDidMount (){
        httpRequests.getTargetList();
    }

    async componentWillReceiveProps (nextProps){
        let {targetList} = nextProps;
        await this.setState({targetList, targetListBackup: targetList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                targetList: [...this.state.targetListBackup].filter(({targetId = ''}) => String(targetId).match(query))
            });
        } else {
            this.setState({targetList: this.state.targetListBackup});
        }
    }

    create (){

    }

    render (){
        let {targetList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: targetList,
            pagination: 'normal',
            rowKey: record => `${record.targetId}-${record.service}`,
            locale: {
                emptyText: lang('暂无存储目标', 'No Storage Target')
            },
            title: () => (<span className="fs-table-title"><Icon type="desktop" />{lang('存储目标', 'Storage Target')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('目标ID', 'Target ID'), width: 100, dataIndex: 'targetId',},
                {title: lang('挂载路径', 'Mount Path'), width: 200, dataIndex: 'mountPath',},
                {title: lang('所属节点', 'Node'), width: 200, dataIndex: 'node',},
                {title: lang('服务角色', 'Service Role'), width: 200, dataIndex: 'service',},
                {title: lang('服务ID', 'Service ID'), width: 100, dataIndex: 'nodeId',},
                {title: lang('容量', 'Capacity'), width: 130, dataIndex: 'space',
                    render: text =>  text === '--' ? '--' : (
                        <Popover
                            placement="top"
                            trigger='click'
                            content={
                                <div className="fs-target-popover-content">
                                    <p>{lang('总容量', 'Total Capacity')}: <span>{formatStorageSize(text.total)}</span></p>
                                    <p>{lang('已使用容量', 'Used Capacity')}: <span>{formatStorageSize(text.used)}</span></p>
                                    <p>{lang('剩余容量', 'Remaining Capacity')}: <span>{formatStorageSize(text.free)}</span></p>
                                    <p>{lang('容量使用率', 'Capacity Usage Rate')}: <span>{text.usage}</span></p>
                                </div>
                            }
                        >
                            <div className="fs-capacity-bar small" style={{width: 100}}>
                                <div
                                    className="fs-capacity-used-bar"
                                    style={{width: text.usage > '1%' ? text.usage : '1px', background: getCapacityColour(text.usage)}}
                                />
                            </div>
                            <span className="fs-physical-node-capacity">{formatStorageSize(text.total)}</span>
                        </Popover>
                    )
                },
            ],
        };
        return (
            <div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <Input.Search
                        size="small"
                        placeholder={lang('存储目标ID', 'Storage Target ID')}
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
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {target: {targetList}}} = state;
    return {language, targetList};
};

export default connect(mapStateToProps)(Target);