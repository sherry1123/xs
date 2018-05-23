import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Radio, Table, Popover} from 'antd';
import lang from '../../components/Language/lang';
import {formatStorageSize, getCapacityColour} from '../../services';

class PhysicalNodeTargetList extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentServerType: 'metadata'
        };
    }

    switchService ({target: {value}}){
        this.setState({currentServerType: value});
    }

    render (){
        let {currentServerType} = this.state;
        let {physicalNodeTargets, physicalNodeInfo: {service: {metadata, storage}}} = this.props;
        physicalNodeTargets = physicalNodeTargets.filter(target => target.service === currentServerType);
        let serviceTypeMap = {
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
                {title: lang('目标ID', 'Target ID'), width: 100, dataIndex: 'targetId',},
                {title: lang('挂载路径', 'Mount Path'), width: 100, dataIndex: 'mountPath'},
                {title: lang('所属节点', 'Node Belong'), width: 100, dataIndex: 'node',},
                {title: lang('所属服务', 'Service Belong'), width: 100, dataIndex: 'service',
                    render: text => serviceTypeMap[text]
                },
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
                <header>
                    <Icon type="hdd" />{lang(`节点${serviceTypeMap[currentServerType]}存储目标`, `Node ${serviceTypeMap[currentServerType]} Service Targets`)}
                    <div className="fs-header-button-box">
                        <Radio.Group
                            value={this.state.currentServerType}
                            onChange={this.switchService.bind(this)}
                        >
                            {metadata === 1 && <Radio value="metadata">{lang('元数据服务', 'Metadata Service')}</Radio>}
                            {storage === 1 &&<Radio value="storage">{lang('存储服务', 'Storage Service')}</Radio>}
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