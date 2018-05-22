import React, {Component} from 'react';
import {connect} from "react-redux";
import {Icon, Table, Popover} from 'antd';
import lang from '../../components/Language/lang';
import {formatStorageSize, getCapacityColour} from '../../services';

class PhysicalNodeList extends Component {
    forwardDataNodePage (hostname){
        console.info(hostname);
    }

    render (){
        let serviceRoleMap = {
            metadata: lang('元数据服务', 'Metadata'),
            storage: lang('存储服务', 'Storage'),
            mgmt: lang('管理服务', 'Management')
        };
        let physicalNodeList = [
            {hostname: 'orcafs_1', ip: '192.168.100.48', service: ['storage'], status: true, cpuUsage: '30%', memoryUsage: '60%', space: {total: 5, used: 1, free: 4, usage: '20%'}},
            {hostname: 'orcafs_2', ip: '192.168.100.49', service: ['storage'], status: true, cpuUsage: '20%', memoryUsage: '50%', space: {total: 5, used: 2, free: 3, usage: '40%'}},
            {hostname: 'orcafs_3', ip: '192.168.100.50', service: ['metadata', 'storage'], status: true, cpuUsage: '25%', memoryUsage: '55%', space: {total: 5, used: 4, free: 1, usage: '80%'}},
            {hostname: 'orcafs_4', ip: '192.168.100.51', service: ['mgmt'], status: true, cpuUsage: '15%', memoryUsage: '30%', space: '--'},
            {hostname: 'orcafs_5', ip: '192.168.100.52', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
            {hostname: 'orcafs_6', ip: '192.168.100.53', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
            {hostname: 'orcafs_7', ip: '192.168.100.54', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
            {hostname: 'orcafs_8', ip: '192.168.100.55', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
            {hostname: 'orcafs_9', ip: '192.168.100.56', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
            {hostname: 'orcafs_10', ip: '192.168.100.57', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
            {hostname: 'orcafs_11', ip: '192.168.100.58', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
            {hostname: 'orcafs_12', ip: '192.168.100.59', service: ['mgmt'], status: false, cpuUsage: '--', memoryUsage: '--', space: '--'},
        ];
        let tableProps = {
            dataSource: physicalNodeList,
            pagination: false,
            rowKey: 'hostname',
            locale: {
                emptyText: lang(' ', ' ')
            },
            scroll: {y: 270},
            columns: [
                {title: lang('节点名称', 'Node Hostname'), width: 100, dataIndex: 'hostname',
                    render: text => <a onClick={this.forwardDataNodePage.bind(this, text)}>{text}</a>
                },
                {title: lang('节点IP', 'Node IP'), width: 100, dataIndex: 'ip'},
                {title: lang('服务角色', 'Service Role'), width: 80, dataIndex: 'service',
                    render: text => text.map(role => serviceRoleMap[role]).join(', ')
                },
                {title: lang('节点状态', 'Node Status'), width: 100, dataIndex: 'status',
                    render: text => text ?
                        <span className="fs-physical-node-normal">{lang('正常', 'Normal')}</span> :
                        <span className="fs-physical-node-abnormal">{lang('异常', 'Abnormal')}</span>
                },
                {title: lang('CPU使用率', 'CPU Usage Rate'), width: 100, dataIndex: 'cpuUsage'},
                {title: lang('内存使用率', 'Memory Usage Rate'), width: 100, dataIndex: 'memoryUsage'},
                {title: lang('容量', 'Capacity'), width: 100, dataIndex: 'space',
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
                        </Popover>
                    )
                },
            ],
        };
        return (
            <div className="fs-physical-node-wrapper">
                <header><Icon type="laptop" /> {lang('集群物理节点', 'Physical Node')}</header>
                <Table {...tableProps} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(PhysicalNodeList);