import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from '../../components/Language/lang';
import {DataSet} from '@antv/data-set';
import OChart from '../../components/OChart';
import {randomBoolean} from '../../services';

let sourceData = [
    { time: '19:01', workRequest: 711, queuedWorkRequest: 3.9 },
    { time: '19:02', workRequest: 958, queuedWorkRequest: 4.2 },
    { time: '19:03', workRequest: 752, queuedWorkRequest: 5.7 },
    { time: '19:04', workRequest: 658, queuedWorkRequest: 8.5 },
    { time: '19:05', workRequest: 556, queuedWorkRequest: 7.9 },
    { time: '19:06', workRequest: 525, queuedWorkRequest: 4.2 },
    { time: '19:07', workRequest: 995, queuedWorkRequest: 5.0 },
    { time: '19:08', workRequest: 618, queuedWorkRequest: 2.6 },
    { time: '19:09', workRequest: 758, queuedWorkRequest: 6.2 },
    { time: '19:10', workRequest: 711, queuedWorkRequest: 4.3 },
    { time: '19:11', workRequest: 698, queuedWorkRequest: 6.6 },
    { time: '19:13', workRequest: 503, queuedWorkRequest: 4.8 },
    { time: '19:14', workRequest: 856, queuedWorkRequest: 3.9 },
    { time: '19:15', workRequest: 455, queuedWorkRequest: 4.2 },
    { time: '19:16', workRequest: 622, queuedWorkRequest: 5.7 },
    { time: '19:17', workRequest: 726, queuedWorkRequest: 8.5 },
    { time: '19:18', workRequest: 562, queuedWorkRequest: 8.9 },
    { time: '19:19', workRequest: 565, queuedWorkRequest: 2.2 },
    { time: '19:20', workRequest: 758, queuedWorkRequest: 4.0 },
    { time: '19:21', workRequest: 625, queuedWorkRequest: 6.6 },
    { time: '19:22', workRequest: 845, queuedWorkRequest: 5.2 },
    { time: '19:23', workRequest: 875, queuedWorkRequest: 4.3 },
    { time: '19:24', workRequest: 898, queuedWorkRequest: 6.6 },
    { time: '19:25', workRequest: 818, queuedWorkRequest: 6.6 }
];

class MetadataNodesOverview extends Component {
    constructor (props){
        super(props);
        this.state = {
            chartData: this.chartDataGenerator()
        };
    }

    mockDataGenerator (){
        setInterval(() => {
            let {time, workRequest, queuedWorkRequest} = sourceData[sourceData.length - 1];
            let [hour, min] = time.split(':').map(time => parseInt(time, 0));
            min += 1;
            if (min > 60){
                min = '00';
                hour += 1;
                if (hour > 24){
                    hour = '00';
                }
            }
            randomBoolean() ? ((workRequest += 50) && (queuedWorkRequest -= 3)) : ((workRequest -= 50) && (queuedWorkRequest += 3));
            workRequest < 400 && (workRequest = 600);
            queuedWorkRequest < 0 && (queuedWorkRequest = 0);
            let newLastData = {time: `${hour}:${min}`, workRequest, queuedWorkRequest};
            sourceData.shift();
            sourceData.push(newLastData);
            this.setState({
                chartData: this.chartDataGenerator()
            });
        }, 1000);
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
            min: 0,
            max: 1,
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