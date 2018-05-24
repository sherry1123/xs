import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Icon, Table, Popover} from 'antd';
import lang from '../../components/Language/lang';
import {formatStorageSize, getCapacityColour} from '../../services';
import routerPath from '../routerPath';
import dataNodeAction from '../../redux/actions/dataNodeAction';

class ClusterPhysicalNodeList extends Component {
    forwardDataNodePage (physicalNode){
        console.info(physicalNode);
        this.props.setCurrentPhysicalNode(physicalNode);
        this.props.history.push(routerPath.Main + routerPath.DataNode);
    }

    render (){
        let {clusterPhysicalNodeList} = this.props;
        let serviceTypeMap = {
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
                {title: lang('节点名称', 'Node Hostname'), width: 100, dataIndex: 'hostname',
                    render: (text, record) => record.isPureMgmt ?
                        text :
                        <a onClick={this.forwardDataNodePage.bind(this, record)}>{text}</a>
                },
                {title: lang('节点IP', 'Node IP'), width: 60, dataIndex: 'ip'},
                {title: lang('服务角色', 'Service Role'), width: 100, dataIndex: 'service',
                    render: text => text.map(role => serviceTypeMap[role]).join(', ')
                },
                {title: lang('节点状态', 'Node Status'), width: 60, dataIndex: 'status',
                    render: text => text ?
                        <span className="fs-physical-node-normal">{lang('正常', 'Normal')}</span> :
                        <span className="fs-physical-node-abnormal">{lang('异常', 'Abnormal')}</span>
                },
                {title: lang('CPU使用率', 'CPU Usage Rate'), width: 80, dataIndex: 'cpuUsage'},
                {title: lang('内存使用率', 'Memory Usage Rate'), width: 80, dataIndex: 'memoryUsage'},
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
                                    style={{width: text.usage, background: getCapacityColour(text.usage)}}
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

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterPhysicalNodeList}}} = state;
    return {language, clusterPhysicalNodeList};
};

const mapDispatchToProps = dispatch => {
    return {
        setCurrentPhysicalNode: currentPhysicalNode => dispatch(dataNodeAction.setCurrentPhysicalNode(currentPhysicalNode)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps)(ClusterPhysicalNodeList));