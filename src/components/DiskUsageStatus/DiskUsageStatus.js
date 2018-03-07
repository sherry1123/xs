import React, {Component} from 'react';
import FSPieChart from '../../components/FSPieChart/FSPieChart';
import lang from '../Language/lang';

export default class DiskUsageStatus extends Component {
    constructor(props) {
        super(props);
    }

    render (){
        return (
            <div className="fs-disk-usage-wrapper">
                <FSPieChart option={this.props.chartOption} />
                <div className="fs-disk-usage-info-wrapper">
                    <div className="fs-disk-usage-info-item">
                        <span className="fs-disk-label-text total">
                            {lang('磁盘总容量', 'Disk Total Capacity')}
                        </span>
                    </div>
                    <div className="fs-disk-usage-info-item">
                        <span className="fs-disk-label-text used">
                            {lang('已使用磁盘容量', 'Used Capacity')}
                        </span>
                    </div>
                    <div className="fs-disk-usage-info-item">
                        <span className="fs-disk-label-text remaining">
                            {lang('剩余磁盘容量', 'Remaining Capacity')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}