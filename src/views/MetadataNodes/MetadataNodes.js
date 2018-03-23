import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Select, Popover} from 'antd';
import QueueAnim from 'rc-queue-anim';
import lang from '../../components/Language/lang';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import StaticsTable from '../../components/StaticsTable/StaticsTable';
import httpRequests from "../../http/requests";
import {lsGet, lsSet} from "../../services";

class MetadataNodes extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentMetadataNode: this.props.status.filter(node => node.value)[0] || {},
            expandSwitchNode: true
        };
    }

    componentDidMount (){
        httpRequests.getMetadataNodeOverviewSummary();
        httpRequests.getMetadataNodeDetailSummary();
    }

    componentWillReceiveProps (nextProps){
        let {status} = nextProps;
        let currentMetadataNode = {};
        if (status.length){
            currentMetadataNode = status.filter(node => node.value)[0];
        }
        let newState = {};
        if (currentMetadataNode.node && !this.state.currentMetadataNode.node){
            // when firstly get the nodes data, request the first node data as current node
            newState['currentMetadataNode'] = currentMetadataNode;
            lsSet('currentMetadataNode', currentMetadataNode);
            this.getCurrentMetadataNodeData();
        }
        this.setState(newState);
    }

    changeExpandSwitchNode (){
        let expandSwitchNode = !this.state.expandSwitchNode;
        this.setState({expandSwitchNode});
    }

    switchNode (nodeNumID){
        let currentMetadataNode = this.props.nodes.filter(node => node.nodeNumID === nodeNumID)[0];
        this.setState({currentMetadataNode});
        // fetch current node data
        lsSet('currentMetadataNode', currentMetadataNode);
        this.getCurrentMetadataNodeData();
    }

    getCurrentMetadataNodeData (){
        let currentStorageNode = lsGet('currentStorageNode');
        if (currentStorageNode){
            httpRequests.getStorageNodeDetailSummary(currentStorageNode);
        }
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
        let downNodesDetail = !downNodesCount ? lang('无异常元数据节点', 'There\'s no metadata nodes down') : (lang('异常元数据节点：', 'Down Metadata Nodes: ') + downNodes.join(','));
        let staticsFilter = ['ip', 'mkdir', 'rmdir', 'sum', 'create', 'open', 'stat', 'unlnk', 'lookLI', 'statLI'];
        return (
            <section className="fs-page-content fs-node-wrapper fs-storage">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('元数据节点', 'Metadata Nodes')}</h3>
                </section>
                <section className="fs-node-item-group">
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper m-t-0 fs-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang('总览', 'Overview')}</h3>
                            <section className="fs-page-item-content fs-node-info-content">
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('基本信息', 'Basic Information')}</span>
                                </span>
                                <QueueAnim className="fs-info-block-group-animation-wrapper" type={['top', 'bottom']} delay={100}>
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
                                    <span className="fs-info-label">{lang('用户操作总览', 'User Operation Overview')}</span>
                                </span>
                                <StaticsTable data={this.props.userOperationStatics} filter={staticsFilter} relaceFirstItem="user ID" />
                            </section>
                        </section>
                    </div>
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper m-t-0 fs-node-info-wrapper">
                            <h3 className="fs-page-title item">
                                {this.state.currentMetadataNode.hostname} {lang('节点详情', 'Node Detail')}
                                <div className={`fs-switch-node-wrapper ${this.state.expandSwitchNode ? '' : 'fold'}`}>
                                    <ArrowButton switchDirection directionRange={['right', 'left']} style={{marginRight: 15}}
                                        title={this.state.expandSwitchNode ? '' : lang('切换节点', 'Switch Node')}
                                        onClick={this.changeExpandSwitchNode.bind(this)}
                                    />
                                    <Select style={{width: 170}} size="small" value={this.state.currentMetadataNode.nodeNumID} onChange={this.switchNode.bind(this)}>
                                        {
                                            this.props.status.map(({node, nodeNumID, value}) =>
                                                <Select.Option key={node} value={nodeNumID} node={node} disabled={!value}>
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
                                <QueueAnim className="fs-info-block-group-animation-wrapper" type={['top', 'bottom']} delay={100}>
                                    <div className="fs-info-block-group" key={1}>
                                        <div className="fs-info-block-item">
                                            <i className="fs-info-block-circle purple" />
                                            <div className="fs-info-block-label">{lang('节点名称', 'Node Name')}</div>
                                            <div className="fs-info-block-value">{this.state.currentMetadataNode.node}</div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle yellow" />
                                            <div className="fs-info-block-label">{lang('状态', 'Node Status')}</div>
                                            <div className="fs-info-block-value">
                                                {
                                                    this.state.currentMetadataNode.value ?
                                                        <span>{lang('正常', 'Up')} <i className="fs-node-status-circle up" title={lang('正常', 'Up')} /></span> :
                                                        <span>{lang('异常', 'Down')} <i className="fs-node-status-circle down" title={lang('异常', 'Down')} /></span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </QueueAnim>
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">{lang('该节点用户操作', 'User Operation On This Node')}</span>
                                </span>
                                <StaticsTable data={this.props.userOperationStatics} filter={staticsFilter} relaceFirstItem="user ID" />
                            </section>
                        </section>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {metadataNode: {overview: {status, userOperationStatics}}}} = state;
    return {language, status, userOperationStatics};
};

export default connect(mapStateToProps)(MetadataNodes);