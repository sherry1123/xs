import React, {Component} from 'react';
import {connect} from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import FSPieChart from '../../components/FSPieChart/FSPieChart';
import {formatStorageSize} from "../../services";
import lang from '../Language/lang';

class DiskUsageStatus extends Component {
    render (){
        let {totalCapacity, usedCapacity, remainingCapacity} = this.props.diskStatus;
        let option = {
            width: 340,
            infoData: [
                {
                    label: lang('总容量', 'Total'),
                    value: formatStorageSize(totalCapacity),
                    color: 'purple'
                }, {
                    label: lang('已使用容量', 'Used'),
                    value: formatStorageSize(usedCapacity),
                    color: 'orange'
                }, {
                    label: lang('剩余容量', 'Remaining'),
                    value: formatStorageSize(remainingCapacity),
                    color: 'dark-gray'
                }
            ],
            chartOption: {
                width: 140,
                height: 140,
                formatter: `${lang('使用率', 'Usage Rate')} \n\n ${(usedCapacity/totalCapacity).toFixed(2) * 100}%`,
                series: [{
                    name: 'totalDiskCapacityStatus',
                    type: 'pie',
                    color: ['#f6b93f', '#e5e5e5'],
                    legend: {
                        data: ['Used Disk Capacity', 'RemainingDiskCapacity']
                    },
                    data: [
                        {value: usedCapacity, name: 'UsedDiskCapacity'},
                        {value: remainingCapacity, name: 'RemainingDiskCapacity'},
                    ]
                }]
            }
        };
        return (
            <div className="fs-disk-usage-wrapper" style={{width: option.width}}>
                <FSPieChart option={option.chartOption} />
                <div className="fs-disk-usage-info-wrapper" style={{height: option.height}}>
                    <QueueAnim className="fs-disk-usage-info-anim-wrapper" type={['right', 'left']} delay={300}>
                    {
                        option.infoData.map((info, i) =>
                            <div className="fs-disk-usage-info-item" key={i}>
                                <span className={`fs-disk-text ${info.color}`}>
                                    <span className="fs-disk-label">{info.label}</span> <b>{info.value}</b>
                                </span>
                            </div>
                        )
                    }
                    </QueueAnim>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

export default connect(mapStateToProps, {}, mergeProps)(DiskUsageStatus);