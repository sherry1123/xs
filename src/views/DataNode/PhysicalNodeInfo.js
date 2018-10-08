import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Select, Popover} from 'antd';
import dataNodeAction from 'Actions/dataNodeAction';
import lang from 'Components/Language/lang';
import {lsGet, lsSet} from 'Services';
import httpRequests from 'Http/requests';

class PhysicalNodeInfo extends Component {
    constructor (props){
        super(props);
        let currentPhysicalNode = lsGet('currentPhysicalNode') || {};
        this.state = {
            showPhysicalNodeSelect: false,
            currentPhysicalNode,
        };
    }

    componentWillReceiveProps (nextProps){
        let {clusterPhysicalNodeList, currentPhysicalNode} = nextProps;
        let preCurrentPhysicalNode = this.state.currentPhysicalNode;
        if (!!currentPhysicalNode.hostname){
            // If currentPhysicalNode.hostname is already existed, it means this props change didn't occur
            // in the page firstly render phase. And in that phase, we got the currentPhysicalNode from
            // localStorage. So when we refresh the browser, we will know the previous value according to the record.
            currentPhysicalNode = currentPhysicalNode.hostname ? currentPhysicalNode : (clusterPhysicalNodeList[0] || {});
            this.setState({currentPhysicalNode});
            lsSet('currentPhysicalNode', currentPhysicalNode);
            if (preCurrentPhysicalNode.hostname !== currentPhysicalNode.hostname){
                this.getPhysicalNodeData(currentPhysicalNode);
            }
        } else {
            // Get currentPhysicalNode from localStorage, if it's an empty object in localStorage, get it from clusterPhysicalNodeList
            let currentPhysicalNode = (!!preCurrentPhysicalNode.hostname ? preCurrentPhysicalNode : clusterPhysicalNodeList[0]) || {};
            console.info(currentPhysicalNode);
            this.setState({currentPhysicalNode});
            lsSet('currentPhysicalNode', currentPhysicalNode);
        }
    }

    getPhysicalNodeData (currentPhysicalNode){
        if (!currentPhysicalNode){
            currentPhysicalNode = this.state.currentPhysicalNode;
        }
        httpRequests.getPhysicalNodeInfo(currentPhysicalNode);
        httpRequests.getPhysicalNodeTargets(currentPhysicalNode);
        httpRequests.getPhysicalNodeCPU(currentPhysicalNode);
        httpRequests.getPhysicalNodeDRAM(currentPhysicalNode);
        httpRequests.getPhysicalNodeTPS(currentPhysicalNode);
        httpRequests.getPhysicalNodeIOPS(currentPhysicalNode);
    }

    showPhysicalNodeSelect (){
        this.setState({showPhysicalNodeSelect: !this.state.showPhysicalNodeSelect});
    }

    switchPhysicalNode (hostname, {props: {option: currentPhysicalNode}}){
        this.setState({showPhysicalNodeSelect: false,});
        this.props.setCurrentPhysicalNode(currentPhysicalNode);
        lsSet('currentPhysicalNode', currentPhysicalNode);
        // get data
        this.getPhysicalNodeData(currentPhysicalNode);
    }

    render (){
        let {showPhysicalNodeSelect, currentPhysicalNode} = this.state;
        let {clusterPhysicalNodeList, physicalNodeInfo: {metadata, storage}} = this.props;
        return (
            <div className="fs-table-operation-wrapper no-bottom-margin">
                <div className="fs-operation-text">
                    <Icon type="database" />
                    {!showPhysicalNodeSelect ?
                        <span style={{paddingLeft: 10}}>
                            {lang('数据节点 ', 'Data Node ')}
                            {currentPhysicalNode.hostname}
                            {
                                currentPhysicalNode.status !== undefined && <i className={`fs-status-circle ${currentPhysicalNode.status ? 'up' : 'down'} m-l`}/>
                            }
                            {
                                currentPhysicalNode.status !== undefined ?
                                    (currentPhysicalNode.status ? lang('正常', 'Normal') : lang('异常', 'Abnormal')) :
                                    lang('', '')
                            }
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
                        value={currentPhysicalNode.hostname}
                        onChange={this.switchPhysicalNode.bind(this)}
                    >
                        {
                            clusterPhysicalNodeList.map((node, i) => (
                                <Select.Option
                                    key={i}
                                    disabled={node.isPureMgmt}
                                    title={node.isPureMgmt ? lang('纯管理节点', 'Pure management node') : ''}
                                    value={node.hostname}
                                    option={node}
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
                            <Icon style={{fontSize: 12}} type="ellipsis" />
                        </a>
                    </Popover>
                }
                <div className="fs-operation-info-box">
                    <div className="fs-operation-info-item">
                        <div className="fs-operation-info-item-value light-green">
                            {metadata}
                        </div>
                        <div className="fs-operation-info-item-label">
                            {lang('元数据服务', 'Metadata Service')}
                        </div>
                    </div>
                    <div className="fs-operation-info-item">
                        <div className="fs-operation-info-item-value orange">
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

const mapDispatchToProps = dispatch => {
    return {
        setCurrentPhysicalNode: currentPhysicalNode => dispatch(dataNodeAction.setCurrentPhysicalNode(currentPhysicalNode)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PhysicalNodeInfo);