import React, {Component} from 'react';
import {connect} from "react-redux";
import {Popover} from 'antd';
import QueueAnim from 'rc-queue-anim';
import {formatStorageSize} from '../../services';
import lang from '../Language/lang';


class StorageTargetGroup extends Component {
    render (){
        return (
            <QueueAnim className="fs-storage-target-group" delay={300}>
                {
                    this.props.storageTargets.map(target => {
                        let {id, pathStr, diskSpaceTotal, diskSpaceUsed, diskSpaceFree} = target;
                        let usedRate = (diskSpaceUsed / diskSpaceTotal * 100).toFixed(2);
                        return (
                            <Popover content={<span className="fs-storage-target-usage-rate">{lang('容量使用率：', 'Capacity Usage Rate: ')}<span>{usedRate}%</span></span>} key={id}>
                                <div className="fs-storage-target-item" >
                                    <div className="fs-storage-target-label">
                                        <span className="fs-storage-target-id">{id}@{pathStr}</span>
                                        <span className="fs-target-chart-label-item total">
                                        {lang('总容量', 'Total')} {formatStorageSize(diskSpaceTotal)}
                                    </span>
                                    </div>

                                    <div className="fs-target-usage-chart">
                                        <div className="fs-target-used-bar" style={{width: usedRate + '100%'}}/>
                                    </div>

                                    <div className="fs-storage-target-label bottom">
                                    <span className="fs-target-chart-label-item used">
                                        {lang('已使用', 'Used')} {formatStorageSize(diskSpaceUsed)}
                                    </span>
                                        <span className="fs-target-chart-label-item unused">
                                        {lang('剩余', 'Remaining')} {formatStorageSize(diskSpaceFree)}
                                    </span>
                                    </div>
                                </div>
                            </Popover>
                        );
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
