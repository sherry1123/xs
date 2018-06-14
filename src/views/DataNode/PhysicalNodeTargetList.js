import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Radio, Table, Popover} from 'antd';
import lang from '../../components/Language/lang';
import {formatStorageSize, getCapacityColour} from '../../services';

class PhysicalNodeTargetList extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentServerType: 'all'
        };
    }

    render (){
        let {currentServerType} = this.state;
        let {physicalNodeTargets, physicalNodeInfo: {metadata, storage}} = this.props;
        if (currentServerType !== 'all'){
            physicalNodeTargets = physicalNodeTargets.filter(target => target.service === currentServerType);
        }
        let serviceRoleMap = {
            all: lang('全部', 'All'),
            metadata: lang('元数据服务', 'Metadata'),
            storage: lang('存储服务', 'Storage'),
        };
        let tableProps = {
            dataSource: physicalNodeTargets,
            pagination: false,
            rowKey: record => `${record.targetId}@${record.mountPath}`,
            locale: {
                emptyText: lang(' ', ' ')
            },
            scroll: {y: 270},
            columns: [
                {title: lang('目标ID', 'Target ID'), width: '15%', dataIndex: 'targetId',},
                {title: lang('挂载路径', 'Mount Path'), width: '20%', dataIndex: 'mountPath'},
                {title: lang('所属节点', 'Node Belong'), width: '15%', dataIndex: 'node',},
                {title: lang('服务角色', 'Service Belong'), width: '25%', dataIndex: 'service',
                    render: text => serviceRoleMap[text]
                },
                {title: lang('容量', 'Capacity'), width: '25%', dataIndex: 'space',
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
                <header>
                    <Icon type="hdd" />{lang(`节点${serviceRoleMap[currentServerType]}存储目标`, `Node ${serviceRoleMap[currentServerType]} Service Targets`)}
                    <div className="fs-header-button-box">
                        <Radio.Group
                            value={this.state.currentServerType}
                            onChange={({target: {value}}) => this.setState({currentServerType: value})}
                        >
                            <Radio value="all">{lang('全部', 'All')}</Radio>
                            <Radio value="metadata" disabled={metadata === 0}>{lang('元数据服务', 'Metadata Service')}</Radio>
                            <Radio value="storage" disabled={storage === 0}>{lang('存储服务', 'Storage Service')}</Radio>
                        </Radio.Group>
                    </div>
                </header>
                <Table {...tableProps} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dataNode: {physicalNodeInfo, physicalNodeTargets}}} = state;
    return {language, physicalNodeInfo, physicalNodeTargets};
};

export default connect(mapStateToProps)(PhysicalNodeTargetList);