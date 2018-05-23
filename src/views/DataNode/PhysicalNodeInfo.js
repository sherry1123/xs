import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Select, Popover} from 'antd';
import lang from '../../components/Language/lang';
import {lsGet, lsSet} from '../../services';
import httpRequests from '../../http/requests';

class PhysicalNodeInfo extends Component {
    constructor (props){
        super(props);
        let currentPhysicalNode = this.props.clusterPhysicalNodeList[0];
        if (!!currentPhysicalNode){
            lsSet('currentPhysicalNode', currentPhysicalNode);
        } else {
            currentPhysicalNode = lsGet('currentPhysicalNode');
        }
        this.state = {
            showPhysicalNodeSelect: false,
            currentPhysicalNode: currentPhysicalNode || {},
        };
    }

    getPhysicalNodeData (currentPhysicalNode){
        if (!currentPhysicalNode){
            currentPhysicalNode = this.state.currentPhysicalNode;
        }
        httpRequests.getPhysicalNodeInfo(currentPhysicalNode);
        httpRequests.getPhysicalNodeTargets(currentPhysicalNode);
        httpRequests.getPhysicalNodeCPU(currentPhysicalNode);
        httpRequests.getPhysicalNodeRAM(currentPhysicalNode);
        httpRequests.getPhysicalNodeTPS(currentPhysicalNode);
        httpRequests.getPhysicalNodeIOPS(currentPhysicalNode);
    }

    componentWillReceiveProps (nextProps){
        let {clusterPhysicalNodeList, currentPhysicalNode} = nextProps;
        if (!this.state.currentPhysicalNode.hostname){
            // no any node selected yet
            currentPhysicalNode = currentPhysicalNode ? currentPhysicalNode : (clusterPhysicalNodeList[0] || {});
            this.setState({currentPhysicalNode});
            lsSet('currentPhysicalNode', currentPhysicalNode);
            this.getPhysicalNodeData(currentPhysicalNode);
        }
    }

    showPhysicalNodeSelect (){
        this.setState({showPhysicalNodeSelect: !this.state.showPhysicalNodeSelect});
    }

    switchPhysicalNode (nodeId, {props: {currentPhysicalNode}}){
        this.setState({
            showPhysicalNodeSelect: false,
            currentPhysicalNode,
        });
        lsSet('currentPhysicalNode', currentPhysicalNode);
        // get data
        this.getPhysicalNodeData(currentPhysicalNode);
    }

    render (){
        let {showPhysicalNodeSelect, currentPhysicalNode} = this.state;
        let {clusterPhysicalNodeList, physicalNodeInfo: {service: {metadata, storage}}} = this.props;
        return (
            <div className="fs-table-operation-wrapper no-bottom-margin">
                <div className="fs-operation-text">
                    <Icon type="database" />
                    {!showPhysicalNodeSelect ?
                        <span style={{paddingLeft: 10}}>
                            {lang('数据节点 ', 'Data Node ')}
                            {currentPhysicalNode.hostname}
                            <i className={`fs-status-circle ${currentPhysicalNode.status ? 'up' : 'down'} m-l`} />{currentPhysicalNode.status ? lang('正常', 'Normal') : lang('异常', 'Abnormal')}
                        </span> :
                        <span style={{paddingLeft: 10}}>
                            {lang('切换数据节点', 'Switch Data Node')}
                        </span>
                    }
                </div>
                {
                    showPhysicalNodeSelect &&
                    <Select
                        style={{marginLeft: 10}}
                        value={currentPhysicalNode.nodeId}
                        onChange={this.switchPhysicalNode.bind(this)}
                    >
                        {
                            clusterPhysicalNodeList.map((node, i) => (
                                <Select.Option
                                    key={i}
                                    disabled={node.isPureMgmt}
                                    title={node.isPureMgmt ? lang('纯管理节点', 'Pure management node') : ''}
                                    value={node.nodeId}
                                    currentPhysicalNode={node}
                                >
                                    {node.hostname}
                                </Select.Option>
                            ))
                        }
                    </Select>
                }
                {
                    !!currentPhysicalNode.hostname && !showPhysicalNodeSelect &&
                    <Popover
                        content={lang('切换数据节点', 'Switch data node')}
                    >
                        <a
                            onClick={this.showPhysicalNodeSelect.bind(this)}
                        >
                            <Icon style={{marginLeft: 20, fontSize: 12}} type="sync" />
                        </a>
                    </Popover>
                }
                <div className="fs-operation-info-box">
                    <div className="fs-operation-info-item">
                        <div className="fs-operation-info-item-value">
                            {metadata}
                        </div>
                        <div className="fs-operation-info-item-label">
                            {lang('元数据服务', 'Metadata Service')}
                        </div>
                    </div>
                    <div className="fs-operation-info-item">
                        <div className="fs-operation-info-item-value">
                            {storage}
                        </div>
                        <div className="fs-operation-info-item-label">
                            {lang('存储服务', 'Storage Service')}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterPhysicalNodeList}, dataNode: {physicalNodeInfo, currentPhysicalNode}}} = state;
    return {language, clusterPhysicalNodeList, physicalNodeInfo, currentPhysicalNode};
};

export default connect(mapStateToProps)(PhysicalNodeInfo);