import React, {Component} from 'react';
import {connect} from "react-redux";
import {Icon} from 'antd';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import lang from "../../components/Language/lang";
import {formatStorageSize} from "../../services";

class ThroughputStatistics extends Component {

    render (){
        let option = {
            height: 200, y: 10, legend: [], labelTimeFormat: 'HH:mm:ss',
            formatterFn: value => formatStorageSize(value),
            label: [1526910460000,1526910445000,1526910430000,1526910415000,1526910400000,1526910385000,1526910370000,1526910355000,1526910340000,1526910325000,1526910310000,1526910295000,1526910280000,1526910265000,1526910250000,1526910235000,1526910220000,1526910205000,1526910190000,1526910175000,1526910160000,1526910145000,1526910130000,1526910115000,1526910100000,1526910085000,1526910070000,1526910055000,1526910040000,1526910025000,1526910010000,1526909995000,1526909980000,1526909965000,1526909950000,1526909935000,1526909920000,1526909905000,1526909890000,1526909875000,1526909860000,1526909845000,1526909830000,1526909815000,1526909800000,1526909785000,1526909770000,1526909755000,1526909740000,1526909725000,1526909710000,1526909695000,1526909680000,1526909665000,1526909650000,1526909635000,1526909620000,1526909605000,1526909590000,1526909575000],
            series: [
                {data: [4804,5547,567,1554,7135,641,3709,9422,2798,9591,2860,1464,3939,9391,1080,9669,3719,2759,1096,9889,8459,6162,7983,4365,2498,8608,4837,2319,8708,1653,2858,3886,8338,954,6774,1728,5186,6294,3693,2168,7803,7351,5692,1444,5915,397,1935,1290,1529,6663,2573,2653,9476,3961,2294,67,3414,1491,879,1435],
                    name: lang('集群吞吐量', 'Cluster Throughput'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#93bdfe', '#eef3ff'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="area-chart" /> {lang('集群吞吐量', 'Cluster Throughput')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(ThroughputStatistics);