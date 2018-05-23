import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import lang from '../../components/Language/lang';
import {formatStorageSize} from '../../services';

class ThroughputStatistics extends Component {
    render (){
        let {clusterThroughput: {total, time}} = this.props;
        let option = {
            height: 200, y: 10, legend: [], labelTimeFormat: 'HH:mm:ss',
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
                <header><Icon type="area-chart" /> {lang('集群吞吐量', 'Cluster Throughput')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterThroughput}}} = state;
    return {language, clusterThroughput};
};

export default connect(mapStateToProps)(ThroughputStatistics);