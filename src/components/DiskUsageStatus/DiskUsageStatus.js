import React, {Component} from 'react';
import {connect} from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import FSPieChart from '../../components/FSPieChart/FSPieChart';
import {formatStorageSize} from "../../services";
import lang from '../Language/lang';

class DiskUsageStatus extends Component {
    render (){
        let {diskSpaceTotal, diskSpaceUsed, diskSpaceFree} = this.props.diskStatus;
        let option = {
            width: 340,
            infoData: [
                {
                    label: lang('总容量', 'Total'),
                    value: formatStorageSize(diskSpaceTotal),
                    color: 'blue'
                }, {
                    label: lang('已使用容量', 'Used'),
                    value: formatStorageSize(diskSpaceUsed),
                    color: 'orange'
                }, {
                    label: lang('剩余容量', 'Remaining'),
                    value: formatStorageSize(diskSpaceFree),
                    color: 'dark-gray'
                }
            ],
            chartOption: {
                width: 140,
                height: 140,
                // formatter: `${lang('使用率', 'Usage Rate')} \n\n ${((diskSpaceUsed/diskSpaceTotal).toFixed(2)) * 100}%`,
                formatter: `${lang('使用率', 'Usage Rate')} \n\n 10%`,
                series: [{
                    name: 'totalDiskCapacityStatus',
                    type: 'pie',
                    color: ['#f6b93f', '#e5e5e5'],
                    legend: {
                        data: ['Used Disk Capacity', 'RemainingDiskCapacity']
                    },
                    data: [
                        // {value: diskSpaceUsed, name: 'UsedDiskCapacity'},
                        // {value: diskSpaceFree, name: 'RemainingDiskCapacity'},
                        {value: 1, name: 'UsedDiskCapacity'},
                        {value: 9, name: 'RemainingDiskCapacity'},
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