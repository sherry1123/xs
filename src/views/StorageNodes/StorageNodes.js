import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Select, Table} from 'antd';
import lang from '../../components/Language/lang';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import DiskUsageStatus from '../../components/DiskUsageStatus/DiskUsageStatus';
import {TABLE_LOCALE, formatStorageSize} from '../../services';
import mockData from './mockData';

class StorageNodes extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentNode: this.props.nodes.filter(node => node.up)[0],
            expandSwitchNode: false
        };
    }

    changeExpandSwitchNode (){
        let expandSwitchNode = !this.state.expandSwitchNode;
        this.setState({expandSwitchNode});
    }

    switchNode (nodeID){
        let currentNode = this.props.nodes.filter(node => node.id === nodeID)[0];
        this.setState({currentNode});
        // fetch current node data

    }

    render (){
        let tableProps = {
            size: 'small',
            bordered: false,
            locale: TABLE_LOCALE,
            dataSource: this.props.targetList,
            pagination: this.props.targetList.length > 5 ? {pageSize: 5,size: 'small'} : false,
            rowKey: 'id',
            columns: [{
                title: lang('存储目标ID', 'Storage Target ID'),
                dataIndex: 'id'
            }, {
                title: lang('存储路径', 'Storage Path'),
                dataIndex: 'path'
            }, {
                title: lang('总磁盘容量', 'Total Disk Capacity'),
                dataIndex: 'totalDiskCapacity',
                render: text => formatStorageSize(text)
            }, {
                title: lang('已使用磁盘容量', 'Used Disk Capacity'),
                dataIndex: 'usedDiskCapacity',
                render: text => formatStorageSize(text)
            }, {
                title: lang('剩余磁盘容量', 'Remaining Disk Capacity'),
                dataIndex: 'remainingDiskCapacity',
                render: text => formatStorageSize(text)
            }]
        };
        return (
            <section className="fs-page-content fs-node-wrapper fs-storage">
                <section className="fs-page-item-wrapper title">
                    <h3 className="fs-page-title">{lang('存储节点', 'Metadata Nodes')}</h3>
                </section>
                <section className="fs-node-item-group">
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper fs-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang('总览', 'Overview')}</h3>
                            <section className="fs-page-item-content fs-node-info-content">
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('基本信息', 'Basic Information')}</span>
                                </span>
                                <div className="fs-info-block-group">
                                    <div className="fs-info-block-item">
                                        <i className="fs-info-block-circle purple" />
                                        <div className="fs-info-block-label">{lang('节点总数', 'Total Nodes')}</div>
                                        <div className="fs-info-block-value">{this.props.nodes.length || 0}</div>
                                    </div>
                                    <div className="fs-info-block-item m-l">
                                        <i className="fs-info-block-circle yellow" />
                                        <div className="fs-info-block-label">{lang('正常节点数', 'Up Nodes')}</div>
                                        <div className="fs-info-block-value">
                                            <span>{this.props.nodes.filter(node => node.up).length || 0} <i className="fs-node-status-circle up" title={lang('正常', 'Up')} /></span>
                                        </div>
                                    </div>
                                    <div className="fs-info-block-item m-l">
                                        <i className="fs-info-block-circle orange" />
                                        <div className="fs-info-block-label">{lang('异常节点数', 'Down Nodes')}</div>
                                        <div className="fs-info-block-value">
                                            <span>{this.props.nodes.filter(node => !node.up).length || 0} <i className="fs-node-status-circle down" title={lang('异常', 'Down')} /></span>
                                        </div>
                                    </div>
                                </div>
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('磁盘使用状态', 'Disk Usage Status')}</span>
                                </span>
                                <DiskUsageStatus diskStatus={this.props.diskStatus} />
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('总吞吐量', 'Total Throughput')}</span>
                                </span>
                                <FSLineChart option={mockData.chartProps1} />
                            </section>
                        </section>
                    </div>
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper fs-node-info-wrapper">
                            <h3 className="fs-page-title item">
                                {this.state.currentNode.name} {lang('节点详情', 'Node Detail')}
                                <div className={`fs-switch-node-wrapper ${this.state.expandSwitchNode ? '' : 'fold'}`}>
                                    <ArrowButton switchDirection style={{marginRight: 15}}
                                        title={this.state.expandSwitchNode ? '' : lang('切换节点', 'Switch Node')}
                                        onClick={this.changeExpandSwitchNode.bind(this)}
                                    />
                                    <Select style={{width: 140}} size="small" value={this.state.currentNode.id} onChange={this.switchNode.bind(this)}>
                                        {
                                            this.props.nodes.map(({name, id, up}) =>
                                                <Select.Option key={name} value={id} disabled={!up}>
                                                    <Icon className={up ? 'fs-option-node up' : 'fs-option-node down'} title={up ? lang('正常', 'Up') : lang('异常', 'Down')} type="database" />
                                                    {name}
                                                </Select.Option>
                                            )
                                        }
                                    </Select>
                                </div>
                            </h3>
                            <section className="fs-page-item-content fs-node-info-content">
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('基本信息', 'Basic Information')}</span>
                                </span>
                                <div className="fs-info-block-group">
                                    <div className="fs-info-block-item">
                                        <i className="fs-info-block-circle purple" />
                                        <div className="fs-info-block-label">{lang('节点名称', 'Node Name')}</div>
                                        <div className="fs-info-block-value">{this.state.currentNode.name}</div>
                                    </div>
                                    <div className="fs-info-block-item m-l">
                                        <i className="fs-info-block-circle yellow" />
                                        <div className="fs-info-block-label">{lang('状态', 'Node Status')}</div>
                                        <div className="fs-info-block-value">
                                            {
                                                this.state.currentNode.up ?
                                                <span>{lang('正常', 'Up')} <i className="fs-node-status-circle up" title={lang('正常', 'Up')} /></span> :
                                                <span>{lang('异常', 'Down')} <i className="fs-node-status-circle down" title={lang('异常', 'Down')} /></span>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('吞吐量', 'Throughput')}</span>
                                </span>
                                <FSLineChart option={mockData.chartProps2} />
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('存储目标', 'Storage Target')}</span>
                                </span>
                                <Table {...tableProps} style={{width: '100%'}} />
                            </section>
                        </section>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {storageNodes: {overview: {diskStatus, nodes}, detail: {targetList}}}} = state;
    return {language, diskStatus, nodes, targetList};
};

export default connect(mapStateToProps)(StorageNodes);