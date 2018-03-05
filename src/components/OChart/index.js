import React, {Component}from 'react';
import {Chart, Tooltip, Axis, Legend, Line/*, Point*/} from 'viser-react';
import lang from '../../components/Language/lang';

export default class OChart extends Component {
    constructor (props){
        super(props);
        let {data, scale, position, color, height = 450} = this.props;
        this.state = {
            data, scale, position, color, height
        };
    }

    componentWillReceiveProps (nextProps){
        let {data} = nextProps;
        this.setState({data});
    }

    render (){
        let {data, scale, position, color, height} = this.state;
        const style = `background-color: {color};width: 8px;height: 8px;border-radius: 50%;display: inline-block;margin-right: 8px;`;
        return (
            <div>
                <Chart data={data} scale={scale} height={height} forceFit animate>
                    <Tooltip itemTpl={`<li data-index="{index}"><span style="${style}"> </span> {value}</li>`} crosshairs={{type: 'Y'}} hideMarkers={true} />
                    <Axis dataKey="number" />
                    <Axis dataKey="time" />
                    <Legend itemFormatter={text => text === 'workRequest' ? lang('工作请求', 'Work Request') : lang('排队的工作请求', 'Queued Work Request')} />
                    <Line position={position} color={color} />
                    {/*<Point position="time*number" color="type" size={0} style={{stroke: '#fff', lineWidth: 0}} shape="circle" />*/}
                </Chart>
            </div>
        );
    }
}

/**
 * This is abstraction for G2 line chart based on Viser
 * G2 parameter brief description
 *
 * @param data Object[] data source, need raw json object array or processed by '@antv/data-set'
 * @param scale Object[] provided as bridge to transform data source to chart with a data range and other options
 * @param position String define which key's value will be render on x-axis or y-axis, such as 'xKey*yKey'
 * @param color String separate the different data types renderer on same chart, and draw them out with different color
 *
 * If need full information about G2, please visit https://antv.alipay.com/zh-cn/g2/3.x/api/index.html
 */
