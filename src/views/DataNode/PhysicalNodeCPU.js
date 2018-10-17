import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from 'Components/FSLineChart/FSLineChart';
import lang from 'Components/Language/lang';

const mapStateToProps = state => {
    const {language, main: {dataNode: {physicalNodeCPU}}} = state;
    return {language, physicalNodeCPU};
};

@connect(mapStateToProps)
export default class PhysicalNodeCPU extends Component {
    render (){
        let {physicalNodeCPU: {total, time}} = this.props;
        let option = {
            height: 200,
            y: 10,
            legend: [],
            labelTimeFormat: 'HH:mm:ss',
            label: time,
            tooltipFormatter: params  => `${params[0].name}<br />${params[0].seriesName}: ${params[0].value}%`,
            yAxisUnit: '%',
            yMin: 0,
            yMax: 100,
            series: [
                {
                    data: total,
                    name: lang('CPU使用率', 'CPU Usage Rate'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#98cbff', '#faffff'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="bar-chart" />{lang('节点CPU使用率', 'Node CPU Usage Rate')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}