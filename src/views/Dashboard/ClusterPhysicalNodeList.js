import React, {Component} from 'react';
import {connect} from 'react-redux';
import dataNodeAction from 'Actions/dataNodeAction';
import {withRouter} from 'react-router-dom';
import {Icon, Table, Popover} from 'antd';
import lang from 'Components/Language/lang';
import {formatStorageSize, getCapacityColour} from 'Services';
import routerPath from '../routerPath';
import {lsGet, lsSet} from 'Services';

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterPhysicalNodeList}}} = state;
    return {language, clusterPhysicalNodeList};
};

const mapDispatchToProps = dispatch => ({
    setCurrentPhysicalNode: currentPhysicalNode => dispatch(dataNodeAction.setCurrentPhysicalNode(currentPhysicalNode)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

@withRouter
@connect(mapStateToProps, mapDispatchToProps, mergeProps)
export default class ClusterPhysicalNodeList extends Component {
    componentWillReceiveProps (nextProps){
        let {clusterPhysicalNodeList} = nextProps;
        if (!!clusterPhysicalNodeList.length){
            let currentPhysicalNode = lsGet('currentPhysicalNode');
            if (!currentPhysicalNode){
                // for fetching statistics data
                lsSet('currentPhysicalNode', clusterPhysicalNodeList[0]);
            }
        }
    }

    forwardDataNodePage (physicalNode){
        // for fetching statistics data
        lsSet('currentPhysicalNode', physicalNode);
        this.props.setCurrentPhysicalNode(physicalNode);
        this.props.history.push(routerPath.Main + routerPath.DataNode);
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0, placement: 'right'};
        let {clusterPhysicalNodeList} = this.props;
        let serviceRoleMap = {
            metadata: lang('元数据服务', 'Metadata'),
            storage: lang('存储服务', 'Storage'),
            mgmt: lang('管理服务', 'Management')
        };
        let tableProps = {
            dataSource: clusterPhysicalNodeList,
            pagination: false,
            rowKey: 'hostname',
            locale: {
                emptyText: lang(' ', ' ')
            },
            scroll: {y: 270},
            columns: [
                {title: lang('节点名称', 'Node Hostname'), width: '15%', dataIndex: 'hostname',
                    render: (text, record) => record.isPureMgmt ?
                        text :
                        <Popover {...buttonPopoverConf} content={lang('点击跳转数据节点查看详情', 'Click to jump data node page to view the details')}>
                            <a onClick={this.forwardDataNodePage.bind(this, record)}>{text}</a>
                        </Popover>
                },
                {title: lang('节点IP', 'Node IP'), width: '11%', dataIndex: 'ip'},
                {title: lang('服务角色', 'Service Role'), width: '20%', dataIndex: 'service',
                    render: text => text.map(role => serviceRoleMap[role]).join(', ')
                },
                {title: lang('节点状态', 'Node Status'), width: '10%', dataIndex: 'status',
                    render: text => text ?
                        <span className="fs-green">{lang('正常', 'Normal')}</span> :
                        <span className="fs-red">{lang('异常', 'Abnormal')}</span>
                },
                {title: lang('CPU使用率', 'CPU'), width: '12%', dataIndex: 'cpuUsage'},
                {title: lang('内存使用率', 'DRAM'), width: '12%', dataIndex: 'memoryUsage'},
                {title: lang('容量', 'Capacity'), width: '20%', dataIndex: 'space',
                    render: (text, record) =>  record.isPureMgmt ? '--' : (
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
            <div className="fs-physical-node-wrapper">
                <header><Icon type="laptop" />{lang('集群物理节点', 'Physical Node')}</header>
                <Table {...tableProps} />
            </div>
        );
    }
}