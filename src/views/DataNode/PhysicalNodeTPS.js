import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import lang from '../../components/Language/lang';
import {formatStorageSize} from '../../services';

class physicalNodeTPS extends Component {
    render (){
        let {physicalNodeTPS: {read, write, time}} = this.props;
        let option = {
            height: 200,
            y: 25,
            legend: {
                data: [lang('读', 'Read'), lang('写', 'Write')],
            },
            labelTimeFormat: 'HH:mm:ss',
            label: time,
            tooltipFormatter: params  => (params[0] && params[1]) ? `
                ${params[0].name}<br />
                ${params[0].seriesName}: ${formatStorageSize(params[0].value)}<br />
                ${params[1].seriesName}: ${formatStorageSize(params[1].value)}
            ` : `
                ${params[0].name}<br />
                ${params[0].seriesName}: ${formatStorageSize(params[0].value)}<br />
            `,
            yAxisLabelFormatter: value => formatStorageSize(value),
            series: [
                {
                    data: read,
                    name: lang('读', 'Read'),
                    type: 'line',
                    itemStyle: {normal: {color: '#f9c9c0', lineStyle: {width: 1}}},
                    area: ['#f8ada1', '#fdeedf'],
                },
                {
                    data: write,
                    name: lang('写', 'Write'),
                    type: 'line',
                    itemStyle: {normal: {color: '#f8a7a6', lineStyle: {width: 1}}},
                    area: ['#fc8a8b', '#eef3ff'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="bar-chart" />{lang('节点', 'Node')} TPS</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dataNode: {physicalNodeTPS}}} = state;
    return {language, physicalNodeTPS};
};

export default connect(mapStateToProps)(physicalNodeTPS);