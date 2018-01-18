import React, {Component}from 'react';
import {Chart, Tooltip, Axis, Legend, Line, Point} from 'viser-react';
import {DataSet} from '@antv/data-set';
import lang from '../../components/Language/lang';

const sourceData = [
    { time: '19:01', workRequest: 511, queuedWorkRequest: 3.9 },
    { time: '19:02', workRequest: 958, queuedWorkRequest: 4.2 },
    { time: '19:03', workRequest: 152, queuedWorkRequest: 5.7 },
    { time: '19:04', workRequest: 658, queuedWorkRequest: 8.5 },
    { time: '19:05', workRequest: 256, queuedWorkRequest: 11.9 },
    { time: '19:06', workRequest: 125, queuedWorkRequest: 15.2 },
    { time: '19:07', workRequest: 995, queuedWorkRequest: 17.0 },
    { time: '19:08', workRequest: 618, queuedWorkRequest: 16.6 },
    { time: '19:09', workRequest: 758, queuedWorkRequest: 14.2 },
    { time: '19:10', workRequest: 711, queuedWorkRequest: 10.3 },
    { time: '19:11', workRequest: 698, queuedWorkRequest: 6.6 },
    { time: '19:13', workRequest: 503, queuedWorkRequest: 4.8 },
    { time: '19:14', workRequest: 856, queuedWorkRequest: 3.9 },
    { time: '19:15', workRequest: 455, queuedWorkRequest: 4.2 },
    { time: '19:16', workRequest: 322, queuedWorkRequest: 5.7 },
    { time: '19:17', workRequest: 326, queuedWorkRequest: 8.5 },
    { time: '19:18', workRequest: 562, queuedWorkRequest: 11.9 },
    { time: '19:19', workRequest: 165, queuedWorkRequest: 15.2 },
    { time: '19:20', workRequest: 758, queuedWorkRequest: 17.0 },
    { time: '19:21', workRequest: 325, queuedWorkRequest: 16.6 },
    { time: '19:22', workRequest: 145, queuedWorkRequest: 14.2 },
    { time: '19:23', workRequest: 875, queuedWorkRequest: 10.3 },
    { time: '19:24', workRequest: 898, queuedWorkRequest: 6.6 },
    { time: '19:25', workRequest: 818, queuedWorkRequest: 6.6 }
];

const dv = new DataSet.View().source(sourceData);

dv.transform({
    type: 'fold',
    fields: ['workRequest', 'queuedWorkRequest'],
    key: 'type',
    value: 'number',
});

const data = dv.rows;

const scale = [{
    dataKey: 'time',
    min: 0,
    max: 1,
}];

//   怎么动态改变数据？

export default class OChart extends Component {
    render (){
        const style = `background-color: {color};width: 8px;height: 8px;border-radius: 50%;display: inline-block;margin-right: 8px;`;
        return (
            <div>
                <Chart forceFit height={400} data={data} scale={scale}>
                    <Tooltip itemTpl={`<li data-index={index}><span style="${style}"> </span> {value}</li>`} crosshairs={{type: 'Y'}} hideMarkers={true} />
                    <Axis />
                    <Legend itemFormatter={text => text === 'workRequest' ? lang('工作请求', 'Work Request') : lang('排队的工作请求', 'Queued Work Request')} />
                    <Line position="time*number" color="type" />
                    <Point position="time*number" color="type" size={0} style={{stroke: '#fff', lineWidth: 0}} shape="circle" />
                </Chart>
            </div>
        );
    }
}
