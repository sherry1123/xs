import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import lang from '../../components/Language/lang';

class PhysicalNodeCPU extends Component {
    render (){
        let {physicalNodeCPU: {total, time}} = this.props;
        let option = {
            height: 200, y: 10, legend: [], labelTimeFormat: 'HH:mm:ss',
            label: time,
            series: [
                {
                    data: total,
                    name: lang('CPU使用率', 'CPU Usage Rate'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#e494ff', '#fceeff'],
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

const mapStateToProps = state => {
    const {language, main: {dataNode: {physicalNodeCPU}}} = state;
    return {language, physicalNodeCPU};
};

export default connect(mapStateToProps)(PhysicalNodeCPU);