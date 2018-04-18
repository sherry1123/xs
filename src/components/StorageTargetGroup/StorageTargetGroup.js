import React, {Component} from 'react';
import {connect} from "react-redux";
import {Popover} from 'antd';
import QueueAnim from 'rc-queue-anim';
import {formatStorageSize} from '../../services';
import lang from '../Language/lang';


class StorageTargetGroup extends Component {
    render (){
        let {storageTargets} = this.props;
        return (
            <QueueAnim className="fs-storage-target-group" delay={300}>
                {
                    !!storageTargets.length ? storageTargets.map(target => {
                        let {targetId, storagePath, totalSpace, usedSpace, freeSpace} = target;
                        let usedRate = (usedSpace / totalSpace * 100).toFixed(2);
                        return (
                            <Popover key={targetId}
                                content={
                                    <div>
                                        <p className="fs-storage-target-popover-item">{lang('目标ID：', 'Target ID: ')}<span>{targetId}</span></p>
                                        <p className="fs-storage-target-popover-item">{lang('路径：', 'Path: ')}<span>{storagePath}</span></p>
                                        <p className="fs-storage-target-popover-item">{lang('容量使用率：', 'Capacity Usage Rate: ')}<span>{usedRate}%</span></p>
                                    </div>
                                }
                            >
                                <div className="fs-storage-target-item" >
                                    <div className="fs-storage-target-label">
                                        <span className="fs-storage-target-id">{targetId}@{storagePath}</span>
                                        <span className="fs-target-chart-label-item total">
                                        {lang('总容量', 'Total')} {formatStorageSize(totalSpace)}
                                    </span>
                                    </div>

                                    <div className="fs-target-usage-chart">
                                        <div className="fs-target-used-bar" style={{width: usedRate + '100%'}}/>
                                    </div>

                                    <div className="fs-storage-target-label bottom">
                                    <span className="fs-target-chart-label-item used">
                                        {lang('已使用', 'Used')} {formatStorageSize(usedSpace)}
                                    </span>
                                        <span className="fs-target-chart-label-item unused">
                                        {lang('剩余', 'Remaining')} {formatStorageSize(freeSpace)}
                                    </span>
                                    </div>
                                </div>
                            </Popover>
                        );
                    }) :
                    <span className="fs-storage-target-no-data">{lang('暂无存储目标', 'No Storage Targets')}</span>
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
