import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from 'Components/FSLineChart/FSLineChart';
import lang from 'Components/Language/lang';

const mapStateToProps = state => {
    const {language, main: {dataNode: {physicalNodeRAM}}} = state;
    return {language, physicalNodeRAM};
};

@connect(mapStateToProps)
export default class PhysicalNodeDRAM extends Component {
    render (){
        let {physicalNodeRAM: {total, time}} = this.props;
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
                    name: lang('内存使用率', 'DRAM Usage Rate'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#e494ff', '#fceeff'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="line-chart" />{lang('节点内存使用率', 'Node DRAM Usage Rate')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}