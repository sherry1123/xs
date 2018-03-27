import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Select, Popover} from 'antd';
import QueueAnim from 'rc-queue-anim';
import lang from '../../components/Language/lang';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import DiskUsageStatus from '../../components/DiskUsageStatus/DiskUsageStatus';
import StorageTargetGroup from '../../components/StorageTargetGroup/StorageTargetGroup';
import {lsGet, lsSet, formatStorageSize} from '../../services';
import httpRequests from '../../http/requests';

class StorageNodes extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentStorageNode: this.props.status.filter(node => node.value)[0] || {},
            expandSwitchNode: true
        };
    }

    componentDidMount (){
        // request overview data
        httpRequests.getStorageNodeOverviewSummary();
        setTimeout(() => httpRequests.getStorageNodeOverviewThroughput(), 1000);
        // request detail data
        this.getCurrentStorageNodeData();
        setTimeout(() => httpRequests.getStorageNodeDetailThroughput(), 1500);
    }

    componentWillReceiveProps (nextProps){
        let {status} = nextProps;
        let currentStorageNode = {};
        if (status.length){
            currentStorageNode = status.filter(node => node.value)[0] || {};
            if (!currentStorageNode.node){
                // if there is no up node, use the first node as current node directly, ignore its dead status
                currentStorageNode = status[0];
            }
        }
        let newState = {};
        if (currentStorageNode.node && !this.state.currentStorageNode.node){
            // when firstly get the nodes data, request the first node data as current node
            newState['currentStorageNode'] = currentStorageNode;
            lsSet('currentStorageNode', currentStorageNode);
            this.getCurrentStorageNodeData();
        }
        this.setState(newState);
    }

    changeExpandSwitchNode (){
        let expandSwitchNode = !this.state.expandSwitchNode;
        this.setState({expandSwitchNode});
    }

    switchNode (nodeNumID){
        let currentStorageNode = this.props.status.filter(node => node.nodeNumID === nodeNumID)[0];
        this.setState({currentStorageNode});
        // fetch current node data
        lsSet('currentStorageNode', currentStorageNode);
        this.getCurrentStorageNodeData();
    }

    getCurrentStorageNodeData (){
        let currentStorageNode = lsGet('currentStorageNode');
        if (currentStorageNode){
            httpRequests.getStorageNodeDetailSummary(currentStorageNode);
        }
    }

    generateThroughChartOption (type){
        let {read, write, sum, time} = this.props[type + 'Throughput'];
        return {
            height: 200, y: 10, legend: [], labelTimeFormat: 'HH:mm:ss',
            formatterFn: value => formatStorageSize(value),
            label: time,
            series: [
                {data: read, name: lang('读', 'Read'), type: 'line', itemStyle: {normal: {color: '#f6b93f', lineStyle: {width: 1}}}},
                {data: write, name: lang('写', 'Write'), type: 'line', itemStyle: {normal: {color: '#fbe81f', lineStyle: {width: 1}}}},
                {data: sum, name: lang('总', 'Sum'), type: 'line', itemStyle: {normal: {color: '#00cc00', lineStyle: {width: 1}}}},
            ]
        };
    }

    render (){
        let totalNodesCount = this.props.status.length || 0;
        let upNodesCount = this.props.status.filter(node => node.value).length || 0;
        let downNodesCount = 0;
        let downNodes = [];
        this.props.status.forEach(({node, value}) => {
            if (!value){
                downNodesCount ++;
                downNodes.push(node);
            }
        });
        let downNodesDetail = !downNodesCount ? lang('无异常存储节点', 'There\'s no storage nodes down') : (lang('异常存储节点：', 'Down Storage Nodes: ') + downNodes.join(','));
        let overviewThroughputChartOption = this.generateThroughChartOption('overview');
        let detailThroughputChartOption = this.generateThroughChartOption('detail');
        return (
            <section className="fs-page-content fs-node-wrapper fs-storage">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('存储节点', 'Storage Nodes')}</h3>
                </section>
                <section className="fs-node-item-group">
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper m-t-0 fs-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang('总览', 'Overview')}</h3>
                            <section className="fs-page-item-content fs-node-info-content">
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('基本信息', 'Basic Information')}</span>
                                </span>
                                <QueueAnim className="fs-info-block-group-animation-wrapper" type={['left', 'right']} delay={200}>
                                    <div className="fs-info-block-group" key={1}>
                                        <div className="fs-info-block-item">
                                            <i className="fs-info-block-circle purple" />
                                            <div className="fs-info-block-label">{lang('节点总数', 'Total Nodes')}</div>
                                            <div className="fs-info-block-value">{totalNodesCount}</div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle yellow" />
                                            <div className="fs-info-block-label">{lang('正常节点数', 'Up Nodes')}</div>
                                            <div className="fs-info-block-value">
                                                <span>{upNodesCount} <i className="fs-node-status-circle up" title={lang('正常', 'Up')} /></span>
                                            </div>
                                        </div>
                                        <Popover content={downNodesDetail}>
                                            <div className="fs-info-block-item m-l pointer">
                                                <i className="fs-info-block-circle orange" />
                                                <div className="fs-info-block-label">{lang('异常节点数', 'Down Nodes')}</div>
                                                <div className="fs-info-block-value">
                                                    <span>{downNodesCount} <i className="fs-node-status-circle down" title={lang('异常', 'Down')} /></span>
                                                </div>
                                            </div>
                                        </Popover>
                                    </div>
                                </QueueAnim>
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('磁盘使用状态', 'Disk Usage Status')}</span>
                                </span>
                                <DiskUsageStatus diskStatus={this.props.diskSpace} />
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('总吞吐量', 'Total Throughput')}</span>
                                </span>
                                <FSLineChart option={overviewThroughputChartOption} />
                            </section>
                        </section>
                    </div>
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper m-t-0 fs-node-info-wrapper">
                            <h3 className="fs-page-title item">
                                {this.state.currentStorageNode.name} {lang('节点详情', 'Node Detail')}
                                <div className={`fs-switch-node-wrapper ${this.state.expandSwitchNode ? '' : 'fold'}`}>
                                    <ArrowButton switchDirection directionRange={['right', 'left']} style={{marginRight: 15}}
                                        title={this.state.expandSwitchNode ? '' : lang('切换节点', 'Switch Node')}
                                        onClick={this.changeExpandSwitchNode.bind(this)}
                                    />
                                    <Select style={{width: 170}} size="small" value={this.state.currentStorageNode.nodeNumID} onChange={this.switchNode.bind(this)}>
                                        {
                                            this.props.status.map(({node, nodeNumID, value}) =>
                                                <Select.Option key={nodeNumID} value={nodeNumID} node={node} disabled={!value}>
                                                    <Icon className={value ? 'fs-option-node up' : 'fs-option-node down'} title={value ? lang('正常', 'Up') : lang('异常', 'Down')} type="database" />
                                                    {node}
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
                                <QueueAnim className="fs-info-block-group-animation-wrapper" type={['left', 'right']} delay={300}>
                                    <div className="fs-info-block-group" key={1}>
                                        <div className="fs-info-block-item">
                                            <i className="fs-info-block-circle purple" />
                                            <div className="fs-info-block-label">{lang('节点名称', 'Node Name')}</div>
                                            <div className="fs-info-block-value">{this.state.currentStorageNode.node}</div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle yellow" />
                                            <div className="fs-info-block-label">{lang('状态', 'Node Status')}</div>
                                            <div className="fs-info-block-value">
                                                {
                                                    this.state.currentStorageNode.value ?
                                                    <span>{lang('正常', 'Up')} <i className="fs-node-status-circle up" title={lang('正常', 'Up')} /></span> :
                                                    <span>{lang('异常', 'Down')} <i className="fs-node-status-circle down" title={lang('异常', 'Down')} /></span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </QueueAnim>
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('存储目标', 'Storage Target')}</span>
                                </span>
                                <StorageTargetGroup storageTargets={this.props.storageTargets} />
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('吞吐量', 'Throughput')}</span>
                                </span>
                                <FSLineChart option={detailThroughputChartOption} />
                            </section>
                        </section>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {storageNode: {overview: {diskSpace, status, overviewThroughput}, detail: {storageTargets, detailThroughput}}}} = state;
    return {language, diskSpace, status, overviewThroughput, storageTargets, detailThroughput};
};

export default connect(mapStateToProps)(StorageNodes);