import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import lang from "../../components/Language/lang";

class IOPSStatistics extends Component {
    render (){
        let {clusterIOPS: {total, time}} = this.props;
        let option = {
            height: 200,
            y: 10,
            legend: [],
            labelTimeFormat: 'HH:mm:ss',
            label: time,
            series: [
                {
                    data: total,
                    name: lang('集群IOPS', 'Cluster IOPS'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#88ffe1', '#dffff4'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="line-chart" />{lang('集群IOPS', 'Cluster IOPS')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterIOPS}}} = state;
    return {language, clusterIOPS};
};

export default connect(mapStateToProps)(IOPSStatistics);