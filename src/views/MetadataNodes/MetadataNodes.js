import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Select, Popover} from 'antd';
import QueueAnim from 'rc-queue-anim';
import lang from '../../components/Language/lang';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import StaticsFilter from '../../components/StaticsTable/StaticsFilter';
import StaticsTable from '../../components/StaticsTable/StaticsTable';
import httpRequests from "../../http/requests";
import {lsGet, lsSet, someUpperCase, metadataStaticsItems} from "../../services";

class MetadataNodes extends Component {
    constructor (props){
        super(props);
        let defaultFilterItems = ['userOrClientName', 'mkdir', 'rmdir', 'sum', 'create', 'open', 'stat', 'statLI'];
        let overviewStaticsFilterItems = lsGet('metadataNodeOverviewStaticFilterItems') || defaultFilterItems;
        let detailStaticsFilterItems = lsGet('metadataNodeDetailStaticFilterItems') || defaultFilterItems;
        this.state = {
            currentMetadataNode: this.props.nodeList.filter(node => node.status)[0] || {},
            expandSwitchNode: true,

            overviewStaticsFilterItems,
            detailStaticsFilterItems,
        };
    }

    componentDidMount (){
        httpRequests.getMetadataNodes();
        httpRequests.getMetadataNodesStatics();
        // httpRequests.getMetadataNodeDetailSummary();
    }

    componentWillReceiveProps (nextProps){
        let {nodeList} = nextProps;
        let currentMetadataNode = {};
        if (nodeList.length){
            currentMetadataNode = nodeList.filter(node => node.status)[0] || {};
            if (!currentMetadataNode.hasOwnProperty('hostname')){
                // if there is no up node, use the first node as current node directly, even if it's down
                currentMetadataNode = nodeList[0];
            }
        }
        let newState = {};
        if (currentMetadataNode.hasOwnProperty('hostname') && !this.state.currentMetadataNode.hasOwnProperty('hostname')){
            // when firstly get the nodes data, request the first node data as current node
            newState['currentMetadataNode'] = currentMetadataNode;
            lsSet('currentMetadataNode', currentMetadataNode);
        }
        this.setState(newState);
    }

    changeExpandSwitchNode (){
        let expandSwitchNode = !this.state.expandSwitchNode;
        this.setState({expandSwitchNode});
    }

    switchNode (nodeId){
        let currentMetadataNode = this.props.nodeList.filter(node => node.nodeId === nodeId)[0] || {};
        this.setState({currentMetadataNode});
        // fetch current node data
        lsSet('currentMetadataNode', currentMetadataNode);
    }

    setStaticsFilter (type, selectedItems){
        if (Array.isArray(selectedItems)){
            this.setState({[type + 'StaticsFilterItems']: selectedItems});
            lsSet(`metadataNode${someUpperCase(type)}StaticFilterItems`, selectedItems);
        }
    }

    render (){
        // summary
        let totalNodesCount = this.props.nodeList.length || 0;
        let upNodesCount = this.props.nodeList.filter(node => node.status).length || 0;
        let downNodesCount = 0;
        let downNodes = [];
        this.props.nodeList.forEach(({hostname, status}) => {
            if (!status){
                downNodesCount ++;
                downNodes.push(hostname);
            }
        });
        // tip
        let downNodesDetail = !downNodesCount ? lang('无异常元数据节点', 'There\'s no metadata nodes down') : (lang('异常元数据节点：', 'Down Metadata Nodes: ') + downNodes.join(','));
        // statics
        let staticsFilterConfig = {
            target: 'user',
            type: 'metadata',
            limit: 8,
            totalItems: metadataStaticsItems,
            selectedItems: this.state.overviewStaticsFilterItems,
        };
        let overviewStaticsFilterConfig = Object.assign({}, staticsFilterConfig, {
            extensionTitle: lang(' - 元数据节点总览', ' - Metadata Node Overview'),
            getFilter: selectedItems => this.setStaticsFilter('overview', selectedItems),
        });
        let detailStaticsFilterConfig = Object.assign({}, staticsFilterConfig, {
            extensionTitle: lang(' - 元数据节点详情', ' - Metadata Node Detail'),
            getFilter: selectedItems => this.setStaticsFilter('detail', selectedItems),
        });
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
                                    <Icon className="fs-static-table-filter-icon" type="setting"
                                        title={lang('过滤配置', 'Filter Setting')}
                                        onClick={() =>{this.overviewStaticFilter.getWrappedInstance().show()}}
                                    />
                                    <StaticsFilter {...overviewStaticsFilterConfig} ref={ref => this.overviewStaticFilter = ref} />
                                </span>
                                <StaticsTable data={this.props.overviewStatics} filter={this.state.overviewStaticsFilterItems} replaceFirstItem="User ID" />
                            </section>
                        </section>
                    </div>
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper m-t-0 fs-node-info-wrapper">
                            <h3 className="fs-page-title item">
                                {this.state.currentMetadataNode.hostname} {lang('节点详情', 'Node Detail')}
                                {
                                    !!this.props.nodeList.length && <div className={`fs-switch-node-wrapper ${this.state.expandSwitchNode ? '' : 'fold'}`}>
                                        <ArrowButton switchDirection directionRange={['right', 'left']} style={{marginRight: 15}}
                                            title={this.state.expandSwitchNode ? '' : lang('切换节点', 'Switch Node')}
                                            onClick={this.changeExpandSwitchNode.bind(this)}
                                        />
                                        <Select style={{width: 170}} size="small"
                                            notFoundContent={lang('暂无节点', 'No Nodes')}
                                            value={this.state.currentMetadataNode.nodeId}
                                            onChange={this.switchNode.bind(this)}
                                        >
                                            {
                                                this.props.nodeList.map(({hostname, nodeId, status}) =>
                                                    <Select.Option key={hostname} value={nodeId} node={hostname} disabled={!status}>
                                                        <Icon className="fs-option-node up" title={status ? lang('正常', 'Up') : lang('异常', 'Down')} type="database" />
                                                        {hostname}
                                                    </Select.Option>
                                                )
                                            }
                                        </Select>
                                    </div>
                                }
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
                                            <div className="fs-info-block-value">{this.state.currentMetadataNode.hostname || '--'}</div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle yellow" />
                                            <div className="fs-info-block-label">{lang('状态', 'Node Status')}</div>
                                            <div className="fs-info-block-value">
                                                {
                                                    this.state.currentMetadataNode.status === true ?
                                                        <span>{lang('正常', 'Up')} <i className="fs-node-status-circle up" title={lang('正常', 'Up')} /></span> :
                                                        this.state.currentMetadataNode.status !== undefined ?
                                                            <span>{lang('异常', 'Down')} <i className="fs-node-status-circle down" title={lang('异常', 'Down')} /></span> :
                                                            '--'
                                                }
                                            </div>
                                        </div>
                                        <div className="fs-info-block-item m-l">
                                            <i className="fs-info-block-circle orange" />
                                            <div className="fs-info-block-label">{lang('根节点', 'Root Node')}</div>
                                            <div className="fs-info-block-value">
                                                {
                                                    this.state.currentMetadataNode.isRoot === true ?
                                                        lang('是', 'Yes') :
                                                            this.state.currentMetadataNode.status !== undefined ?
                                                                lang('否', 'No') :
                                                                '--'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </QueueAnim>
                                <span className="fs-info-item title">
                                    <span className="fs-info-label">
                                        {lang('该节点用户操作', 'User Operation On This Node')}
                                    </span>
                                    <Icon className="fs-static-table-filter-icon" type="setting"
                                        title={lang('过滤配置', 'Filter Setting')}
                                        onClick={() =>{this.detailStaticFilter.getWrappedInstance().show()}}
                                    />
                                    <StaticsFilter {...detailStaticsFilterConfig} ref={ref => this.detailStaticFilter = ref} />
                                </span>
                                <StaticsTable data={this.props.detailStatics} filter={this.state.detailStaticsFilterItems} replaceFirstItem="User ID" />
                            </section>
                        </section>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {metadataNode: {overview: {nodeList = [], statics: overviewStatics}, detail: {statics: detailStatics}}}} = state;
    return {language, nodeList, overviewStatics, detailStatics};
};

export default connect(mapStateToProps)(MetadataNodes);