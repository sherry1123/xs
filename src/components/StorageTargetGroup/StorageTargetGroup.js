import React, {Component} from 'react';
import {connect} from "react-redux";
import {Popover} from 'antd';
import QueueAnim from 'rc-queue-anim';
import {formatStorageSize} from '../../services';
import lang from '../Language/lang';


class StorageTargetGroup extends Component {
    render (){
        return (
            <QueueAnim className="fs-storage-target-group">
                {
                    this.props.targets.map(target => {
                        let {id, path, totalDiskCapacity, usedDiskCapacity, remainingDiskCapacity} = target;
                        let usedRate = (usedDiskCapacity / totalDiskCapacity * 100).toFixed(2);
                        return <div className="fs-storage-target-item" key={id}>
                            <div className="fs-storage-target-label">
                                <span className="fs-storage-target-id">{id}@{path}</span>
                                <span className="fs-target-chart-label-item total">
                                    {lang('总容量', 'Total')} {formatStorageSize(totalDiskCapacity)}
                                </span>
                            </div>
                            <Popover content={`容量使用率：${usedRate}%`}>
                            <div className="fs-target-usage-chart">
                                <div className="fs-target-used-bar" style={{width: usedRate + '100%'}}/>
                            </div>
                            </Popover>
                            <div className="fs-storage-target-label bottom">
                                <span className="fs-target-chart-label-item used">
                                    {lang('已使用', 'Used')} {formatStorageSize(usedDiskCapacity)}
                                </span>
                                <span className="fs-target-chart-label-item unused">
                                    {lang('剩余', 'Remaining')} {formatStorageSize(remainingDiskCapacity)}
                                </span>
                            </div>
                        </div>
                    })
                }
            </QueueAnim>
        );
    }
}
const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(StorageTargetGroup);
