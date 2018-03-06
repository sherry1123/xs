import React, {Component} from 'react';
import moment from 'moment';
import echarts from 'echarts';

export default class Chart extends Component {
    constructor (props){
        super(props);
        let {title, width = '100%', height = '100%', x = 90, yAxisUnit = '', yMin = null, yMax = null, formatterFn = '', legend = [], label, series} = this.props.option;
        this.state = {
            title,
            width,
            x,
            height,
            yAxisUnit,
            yMin,
            yMax,
            formatterFn,
            legend,
            label: label.map(label => {
                return moment(new Date(label)).format('HH:mm:ss');
            }),
            series: series.map(series => {
                if (series.type === 'line'){
                    /*curve smoothing*/
                    series['smooth'] = true;
                    // show all symbol
                    series['showAllSymbol'] = false;
                    series['symbolSize'] = 0;
                }
                return series;
            })
        };
    }

    componentDidMount (){
        this.renderChart();
        window.addEventListener('resize', this.resizeChart.bind(this));
    }

    componentWillUnmount (){
        window.removeEventListener('resize', this.resizeChart.bind(this));
    }

    generateOption ({title, label, x, formatterFn, yAxisUnit, yMin, yMax, legend}){
        return {
            title: title,
            tooltip: {
                trigger: 'axis',
                showDelay: 20,
                hideDelay: 100,
                transitionDuration : 0.4,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: '#333',
                borderRadius: 4,
                borderWidth: 0,
                padding: 5,
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#48b',
                        width: 2,
                        type: 'solid'
                    },
                    shadowStyle: {
                        width: 'auto',
                        color: 'rgba(150, 150, 150, 0.3)'
                    }
                },
                textStyle: {
                    color: '#fff'
                }
            },
            legend: legend,
            grid: {
                x: x, y: 50,
                x2: 20, y2: 30
            },
            xAxis: [{
                type: 'category',
                axisLine: {
                    lineStyle: {
                        color: '#C0D0E0'
                    }
                },
                axisLabel: {
                    formatter: '{value}',
                    textStyle: {
                        color: '#5F5F5F'
                    }
                },
                axisTick: {
                    length: 3
                },
                data: label
            }],
            yAxis: [{
                type : 'value',
                min: yMin,
                max: yMax,
                axisLine: {
                    lineStyle: {
                        color: '#C0D0E0'
                    }
                },
                axisLabel: {
                    formatter: formatterFn ? formatterFn : '{value}' + yAxisUnit,
                    textStyle: {color: '#5F5F5F'},
                    margin: 15
                },
                axisTick: {
                    show: false
                },
                splitLine: {show: false},
                splitArea:{show: false}
            }],
            series: this.state.series
        };
    }

    async componentWillReceiveProps(preProps){
        let {label, series, title} = preProps.option;
        await this.setState({
            label: label.map(label => {
                // format 'Wed Aug 16 2017 21:24:26 GMT+0800 (CST)' to '21:24:26'
                return moment(new Date(label)).format('HH:mm:ss');
            }),
            series: series.map(series => {
                if (series.type === 'line'){
                    // curve smoothing
                    series['smooth'] = true;
                    // show all symbol
                    series['showAllSymbol'] = true;
                }
                return series;
            }),
            title
        });
        this.updateChart(this.state);
    }

    renderChart (){
        this._chartInstance = echarts.init(this.chartWrapper);
        this._chartInstance.setOption(this.generateOption(this.state));
    }

    updateChart (data){
        this._chartInstance.setOption(this.generateOption(data));
    }

    resizeChart (){
        //this._chartInstance.resize();
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(this._chartInstance.resize, 300);

    }

    render (){
        return (
            <div className="ceph-chart-content" style={{width: this.state.width, height: this.state.height + 'px'}}
                 ref={chartWrapper => this.chartWrapper = chartWrapper}>
                Sorry, your browser does not support canvas,
                so please replace it with modern browsers that support HTML5 standards.
            </div>
        );
    }
}

/**
 * @props
 * 		options {object}
 * 			{
 * 				title: '折线图', width: '800px', height: '300px',
 * 				legend: {data: ['每月的量']},
 * 				label: ["2017-01", "2017-02", "2017-03", "2017-04", "2017-05", "2017-06"],  // required
 * 				series: [{name: '每月的量', type: 'line', data: [13, 11, 19, 12, 10, 15]}] // required
 * 			}
 *
 * @public method
 * 		updateChart {function params[options,]}   // update the chart data
 */