import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import lang from '../../components/Language/lang';

class PhysicalNodeRAM extends Component {
    render (){
        let {physicalNodeRAM: {total, time}} = this.props;
        let option = {
            height: 200, y: 10, legend: [], labelTimeFormat: 'HH:mm:ss',
            label: time,
            series: [
                {
                    data: total,
                    name: lang('内存使用率', 'RAM Usage Rate'),
                    type: 'line',
                    itemStyle: {normal: {color: '#fff', lineStyle: {width: 1}}},
                    area: ['#e494ff', '#fceeff'],
                },
            ]
        };
        return (
            <div className="fs-statistics-chart-wrapper">
                <header><Icon type="line-chart" />{lang('节点内存使用率', 'Node RAM Usage Rate')}</header>
                <FSLineChart option={option} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dataNode: {physicalNodeRAM}}} = state;
    return {language, physicalNodeRAM};
};

export default connect(mapStateToProps)(PhysicalNodeRAM);