import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from 'Components/FSLineChart/FSLineChart';
import lang from 'Components/Language/lang';
import {formatStorageSize} from 'Services';

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterTPS}}} = state;
    return {language, clusterTPS};
};

@connect(mapStateToProps)
export default class ClusterTPS extends Component {
    render (){
        let {clusterTPS: {total, time}} = this.props;
        let option = {
            height: 200,
            y: 10,
            legend: [],
            labelTimeFormat: 'HH:mm:ss',
            tooltipFormatter: params  => `${params[0].name}<br/>${params[0].seriesName}: ${formatStorageSize(params[0].value)}`,
            yAxisLabelFormatter: value => formatStorageSize(value),
            label: time,
            series: [
                {
                    data: total,
                    name: lang('集群吞吐量', 'Cluster Throughput'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#93bdfe', '#eef3ff'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="bar-chart" />{lang('集群 TPS', 'Cluster TPS')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}