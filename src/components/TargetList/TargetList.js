import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Popover} from 'antd';
import {formatStorageSize, getCapacityColour} from '../../services';
import lang from '../Language/lang';

class TargetUsageRateRanking extends Component {
    render (){
        let buttonPopoverConf = {trigger: 'click', placement: 'bottom'};
        let {targets, className} = this.props;
        let serviceRoleMap = {
            metadata: lang('元数据服务', 'Metadata Service'),
            storage: lang('存储服务', 'Storage Service'),
        };
        return (
            <div className={`fs-target-list ${className || ''}`}>
                {
                    targets.map((target, i) => (
                        <Popover
                            {...buttonPopoverConf}
                            key={i}
                            content={
                                <div className="fs-target-popover-content">
                                    <p>{lang('目标ID', 'Target ID')}: <span>{target.targetId}</span></p>
                                    <p>{lang('挂载路径', 'Mount Path')}: <span>{target.mountPath}</span></p>
                                    <p>{lang('所属节点', 'Node Belong')}: <span>{target.node}</span></p>
                                    <p>{lang('所属服务类型', 'Service Type')}: <span>{serviceRoleMap[target.service]}</span></p>
                                    <p>{lang('所属服务ID', 'Service ID')}: <span>{target.nodeId}</span></p>
                                    <p>{lang('总容量', 'Total Capacity')}: <span>{formatStorageSize(target.space.total)}</span></p>
                                    <p>{lang('已使用容量', 'Used Capacity')}: <span>{formatStorageSize(target.space.used)}</span></p>
                                    <p>{lang('剩余容量', 'Remaining Capacity')}: <span>{formatStorageSize(target.space.free)}</span></p>
                                    <p>{lang('容量使用率', 'Capacity Usage Rate')}: <span>{target.space.usage}</span></p>
                                </div>
                            }
                        >
                            <section className="fs-target-item-wrapper">
                                <header>
                                    <span>{lang('目标ID', 'Target ID')}: {target.targetId}</span>
                                    <span>{lang('总容量', 'Total Capacity')}: {formatStorageSize(target.space.total)}</span>
                                    {/*
                                    <span>{lang('容量使用率', 'Capacity Usage Rate')}: {target.space.usage}</span>
                                    */}
                                </header>
                                <div className="fs-capacity-bar">
                                    <div
                                        className="fs-capacity-used-bar"
                                        style={{width: target.space.usage > '1%' ? target.space.usage : '1px', background: getCapacityColour(target.space.usage)}}
                                    />
                                </div>
                            </section>
                        </Popover>
                    ))
                }
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(TargetUsageRateRanking);