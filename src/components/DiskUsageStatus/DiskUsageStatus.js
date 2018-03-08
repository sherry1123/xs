import React, {Component} from 'react';
import {connect} from 'react-redux';
import FSPieChart from '../../components/FSPieChart/FSPieChart';
import lang from '../Language/lang';

class DiskUsageStatus extends Component {
    constructor(props) {
        super(props);
    }

    render (){
        let {totalCapacity, usedCapacity, remainingCapacity} = this.props.diskStatus;
        let option = {
            width: 100,
            height: 100,
            formatter: `${lang('已使用', 'Used')} \n\n ${(usedCapacity/totalCapacity).toFixed(2) * 100}%`,
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
        };
        return (
            <div className="fs-disk-usage-wrapper">
                <FSPieChart option={option} />
                <div className="fs-disk-usage-info-wrapper">
                    <div className="fs-disk-usage-info-item">
                        <span className="fs-disk-label-text total">
                            {lang('总容量', 'Disk Total Capacity')}
                        </span>
                    </div>
                    <div className="fs-disk-usage-info-item">
                        <span className="fs-disk-label-text orange">
                            {lang('已使用容量', 'Used Capacity')}
                        </span>
                    </div>
                    <div className="fs-disk-usage-info-item">
                        <span className="fs-disk-label-text dark-gray">
                            {lang('剩余容量', 'Remaining Capacity')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {storageNodes: {overview: {diskStatus}}}} = state;
    return {language, diskStatus};
};

export default connect(mapStateToProps)(DiskUsageStatus);