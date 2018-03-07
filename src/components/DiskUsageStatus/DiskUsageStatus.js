import React, {Component} from 'react';
import FSPieChart from '../../components/FSPieChart/FSPieChart';

export default class FSPieChart extends Component {
    constructor(props) {
        super(props);
    }

    render (){
        return (
            <div className="fs-disk-usage-wrapper">
                <div className="fs-disk-usage-chart-wrapper">
                    <FSPieChart />
                </div>
                <div className="fs-disk-usage-info-wrapper">

                </div>
            </div>
        );
    }
}