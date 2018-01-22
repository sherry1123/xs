import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from '../../components/Language/lang';
import {DataSet} from '@antv/data-set';
import OChart from '../../components/OChart';
import moment from 'moment';
import {randomBoolean} from '../../services';

let sourceData = [];

class MetadataNodesOverview extends Component {
    constructor (props){
        super(props);
        this.state = {
            chartData: this.chartDataGenerator()
        };
    }

    mockDataGenerator (){
        let lastData = sourceData[sourceData.length - 1];
        !lastData && (lastData = {time: moment().format(), workRequest: 654, queuedWorkRequest: 4});
        let {time, workRequest, queuedWorkRequest} = lastData;
        time = moment().format();
        randomBoolean() ? ((workRequest += 50) && (queuedWorkRequest -= 3)) : ((workRequest -= 50) && (queuedWorkRequest += 3));
        workRequest < 400 && (workRequest = 600);
        queuedWorkRequest < 0 && (queuedWorkRequest = 0);
        let newLastData = {time, workRequest, queuedWorkRequest};
        sourceData.length >= 200 && sourceData.shift();
        sourceData.push(newLastData);
        this.setState({
            chartData: this.chartDataGenerator()
        });
        setTimeout(() => {
            this.mockDataGenerator();
        }, 2000);
    }

    chartDataGenerator (){
        let dv = new DataSet.View().source(sourceData);
        dv.transform({
            type: 'fold',
            fields: ['workRequest', 'queuedWorkRequest'],
            key: 'type',
            value: 'number',
        });
        let data = dv.rows;
        let scale = [{
            dataKey: 'time',
            type: 'time',
            formatter: val => moment(val).format('H:mm:ss'),
            tickCount: 10
        }];
        return {data, scale, position: 'time*number', color: 'type'}
    }

    componentDidMount (){
        this.mockDataGenerator();
    }

    render (){
        let {data, scale, position, color} = this.state.chartData;
        return (
            <section className="fs-page-content fs-metadata-node-overview-wrapper">
                <section className="fs-metadata-node-basic-info-wrapper">
                    <section className="fs-page-title-wrapper">
                        <h3>{lang('元数据节点基础信息', 'Metadata Nodes Basic Information')}</h3>
                    </section>
                    <section className="fs-metadata-node-basic-info-content">
                        <span className="fs-info-item">
                            <span className="fs-info-label">{lang('节点数量：', 'Node Number:')}</span>
                            5
                        </span>
                        <span className="fs-info-item">
                            <span className="fs-info-label">{lang('状态：', 'Status: ')}</span>
                            <i className="fs-node-status up" title={lang('正常', 'up')} /> 4
                            <i className="fs-node-status down" title={lang('异常', 'error')} /> 1
                        </span>
                    </section>
                </section>
                <section className="fs-metadata-work-request-wrapper">
                    <section className="fs-page-title-wrapper">
                        <h3>{lang('工作请求', 'Work Request')}</h3>
                    </section>
                    <section className="fs-metadata-work-request-content">
                        <OChart data={data} scale={scale} position={position} color={color} />
                    </section>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(MetadataNodesOverview);