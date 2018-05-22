import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import lang from "../../components/Language/lang";
import {formatStorageSize} from "../../services";

class IOPSStatistics extends Component {

    render (){
        let option = {
            height: 200, y: 10, legend: [], labelTimeFormat: 'HH:mm:ss',
            formatterFn: value => formatStorageSize(value),
            label: [1526910460000,1526910445000,1526910430000,1526910415000,1526910400000,1526910385000,1526910370000,1526910355000,1526910340000,1526910325000,1526910310000,1526910295000,1526910280000,1526910265000,1526910250000,1526910235000,1526910220000,1526910205000,1526910190000,1526910175000,1526910160000,1526910145000,1526910130000,1526910115000,1526910100000,1526910085000,1526910070000,1526910055000,1526910040000,1526910025000,1526910010000,1526909995000,1526909980000,1526909965000,1526909950000,1526909935000,1526909920000,1526909905000,1526909890000,1526909875000,1526909860000,1526909845000,1526909830000,1526909815000,1526909800000,1526909785000,1526909770000,1526909755000,1526909740000,1526909725000,1526909710000,1526909695000,1526909680000,1526909665000,1526909650000,1526909635000,1526909620000,1526909605000,1526909590000,1526909575000],
            series: [
                {
                    data: [4804,5547,5367,4554,5135,6641,4709,6422,4798,3991,2860,1464,3939,4391,5080,5669,3719,2759,1096,3889,5459,6162,7983,6365,5498,4608,4837,2319,5708,3653,2858,3886,4338,3954,5774,3728,5186,6294,3693,2168,4803,4351,5692,3444,5915,4397,3935,2290,1529,2663,2573,2653,3476,3961,4294,3367,3414,2491,1879,1435],
                    name: lang('集群IOPS', 'Cluster IOPS'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#88ffe1', '#dffff4'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="line-chart" /> {lang('集群IOPS', 'Cluster IOPS')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(IOPSStatistics);