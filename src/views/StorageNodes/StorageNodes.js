import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Select} from 'antd';
import QueueAnim from 'rc-queue-anim';
import lang from '../../components/Language/lang';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import DiskUsageStatus from '../../components/DiskUsageStatus/DiskUsageStatus';
import StorageTargetGroup from '../../components/StorageTargetGroup/StorageTargetGroup';
import httpRequests from '../../http/requests';
import mockData from './mockData';

class StorageNodes extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentNode: this.props.status.filter(node => node.value)[0],
            expandSwitchNode: false
        };
    }

    changeExpandSwitchNode (){
        let expandSwitchNode = !this.state.expandSwitchNode;
        this.setState({expandSwitchNode});
    }

    switchNode (nodeNumID, option){
        let {props: {hostname}} = option;
        let currentNode = this.props.status.filter(node => node.nodeNumID === nodeNumID)[0];
        this.setState({currentNode});
        // fetch current node data
        httpRequests.getStorageNodeDetailSummary(hostname, nodeNumID);
    }

    render (){
        // generate overview throughput chart option
        let label = [];
        let series = [
            {name: 'read', type: 'line', itemStyle: {normal: {color: '#f6b93f',lineStyle: {width: 1}}}, data: []},
            {name: 'write', type: 'line', itemStyle: {normal: {color: '#fbe81f',lineStyle: {width: 1}}}, data: []},
            {name: 'sum', type: 'line', itemStyle: {normal: {color: '#00cc00',lineStyle: {width: 1}}}, data: []},
        ];
        this.props.throughput.map(({diskReadSum, diskWriteSum, totalSum, time}) => {
            label.push(time);
            series[0].data.push(diskReadSum);
            series[1].data.push(diskWriteSum);
            series[2].data.push(totalSum);
        });
        let overviewThroughputChartOption = {height: 200, y: 10, legend: [], labelTimeFormat: 'HH:mm', label, series};

        return (
            <section className="fs-page-content fs-node-wrapper fs-storage">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('存储节点', 'Metadata Nodes')}</h3>
                </section>
                <section className="fs-node-item-group">
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper m-t-0 fs-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang('总览', 'Overview')}</h3>
                            <section className="fs-page-item-content fs-node-info-content">
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('基本信息', 'Basic Information')}</span>
                                </span>
                                <QueueAnim type={['left', 'right']}>
                                    <div className="fs-info-block-group" key={1}>
                                        <div className="fs-info-block-item">
                                            <i className="fs-info-block-circle purple" />
                                            <div className="fs-info-block-label">{lang('节点总数', 'Total Nodes')}</div>
                                            <div className="fs-info-block-value">{this.props.status.length || 0}</div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle yellow" />
                                            <div className="fs-info-block-label">{lang('正常节点数', 'Up Nodes')}</div>
                                            <div className="fs-info-block-value">
                                                <span>{this.props.status.filter(node => node.value).length || 0} <i className="fs-node-status-circle up" title={lang('正常', 'Up')} /></span>
                                            </div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle orange" />
                                            <div className="fs-info-block-label">{lang('异常节点数', 'Down Nodes')}</div>
                                            <div className="fs-info-block-value">
                                                <span>{this.props.status.filter(node => !node.value).length || 0} <i className="fs-node-status-circle down" title={lang('异常', 'Down')} /></span>
                                            </div>
                                        </div>
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
                                {this.state.currentNode.name} {lang('节点详情', 'Node Detail')}
                                <div className={`fs-switch-node-wrapper ${this.state.expandSwitchNode ? '' : 'fold'}`}>
                                    <ArrowButton switchDirection style={{marginRight: 15}}
                                        title={this.state.expandSwitchNode ? '' : lang('切换节点', 'Switch Node')}
                                        onClick={this.changeExpandSwitchNode.bind(this)}
                                    />
                                    <Select style={{width: 140}} size="small" value={this.state.currentNode.nodeNumID} onChange={this.switchNode.bind(this)}>
                                        {
                                            this.props.status.map(({hostname, nodeNumID, value}) =>
                                                <Select.Option key={nodeNumID} value={nodeNumID} hostname={hostname} disabled={!value}>
                                                    <Icon className={value ? 'fs-option-node up' : 'fs-option-node down'} title={value ? lang('正常', 'Up') : lang('异常', 'Down')} type="database" />
                                                    {hostname}
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
                                <QueueAnim type={['left', 'right']}>
                                    <div className="fs-info-block-group" key={1}>
                                        <div className="fs-info-block-item">
                                            <i className="fs-info-block-circle purple" />
                                            <div className="fs-info-block-label">{lang('节点名称', 'Node Name')}</div>
                                            <div className="fs-info-block-value">{this.state.currentNode.hostname}</div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle yellow" />
                                            <div className="fs-info-block-label">{lang('状态', 'Node Status')}</div>
                                            <div className="fs-info-block-value">
                                                {
                                                    this.state.currentNode.value ?
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
                                <StorageTargetGroup targets={this.props.targetList} />
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('吞吐量', 'Throughput')}</span>
                                </span>
                                <FSLineChart option={mockData.chartProps2} />
                            </section>
                        </section>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {storageNode: {overview: {diskSpace, status, throughput}, detail: {targetList}}}} = state;
    console.info(throughput);
    return {language, diskSpace, status, throughput, targetList};
};

export default connect(mapStateToProps)(StorageNodes);