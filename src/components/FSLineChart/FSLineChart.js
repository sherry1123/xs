import React, {Component} from 'react';
import {connect} from 'react-redux';
import echarts from 'echarts';
import moment from 'moment';

class FSLineChart extends Component {
    constructor (props){
        super(props);
        let {menuExpand, option: {title, width = '100%', height = '100%', x = 90, y = 50, yAxisUnit = '', yMin = null, yMax = null, labelTimeFormat, tooltipFormatter = '', yAxisLabelFormatter = '', legend = [], label = [], series, resizeDelay = 400}} = this.props;
        this.state = {
            menuExpand,
            title,
            width,
            x,
            y,
            height,
            yAxisUnit,
            yMin,
            yMax,
            labelTimeFormat,
            tooltipFormatter,
            yAxisLabelFormatter,
            legend,
            label: label.map(label => {
                return moment(new Date(label)).format('HH:mm:ss');
            }),
            series: this.makeSeries(series),
            resizeDelay,
        };
    }

    componentDidMount (){
        this.renderChart();
        window.addEventListener('resize', this.resizeChart.bind(this));
    }

    componentWillUnmount (){
        window.removeEventListener('resize', this.resizeChart.bind(this));
    }

    async componentWillReceiveProps (nextProps){
        let {menuExpand, option: {label, series, title}} = nextProps;
        await this.setState({
            label: label.map(label => {
                // format 'Wed Aug 16 2017 21:24:26 GMT+0800 (CST)' to '21:24:26'
                return moment(new Date(label)).format(this.state.labelTimeFormat);
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

        // if sidebar menu expand/fold, should resize chart
        if (menuExpand !== this.state.menuExpand){
            this.resizeChart();
        }
        this.setState({menuExpand});
    }

    makeSeries (series){
        return series.map(series => {
            if (series.type === 'line'){
                // curve smoothing
                series['smooth'] = true;
                // show all symbol
                series['showAllSymbol'] = false;
                series['symbolSize'] = 0;
                if (!!series.area){
                    series['areaStyle'] = {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: series.area[0]},
                                    {offset: 1, color: series.area[1]}
                                ],
                                false
                            )
                        }
                    }
                }
            }
            return series;
        })
    }

    generateOption ({title, label, x, y, tooltipFormatter, yAxisLabelFormatter, yAxisUnit, yMin, yMax, legend}){
        return {
            title: title,
            tooltip: {
                trigger: 'axis',
                showDelay: 20,
                hideDelay: 100,
                transitionDuration: 0.4,
                backgroundColor: 'rgba(100, 100, 100, .7)',
                borderColor: '#333',
                borderRadius: 4,
                borderWidth: 0,
                padding: 5,
                // formatter: '{b} <br /> {a}: {c}',
                formatter: !!tooltipFormatter ? tooltipFormatter : '{b} <br /> {a}: {c}',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#b6b6b6',
                        width: 1,
                        type: 'solid'
                    },
                    shadowStyle: {
                        width: 'auto',
                        color: 'rgba(150, 150, 150, 0.3)'
                    }
                },
                textStyle: {
                    color: '#fff'
                },
            },
            legend,
            grid: {
                x: x, y: y,
                x2: 20, y2: 30
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: '#b6b6b6'
                    }
                },
                axisLabel: {
                    formatter: '{value}',
                    textStyle: {
                        color: '#5f5f5f'
                    }
                },
                axisTick: {
                    length: 3
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#e5e5e5'
                    }
                },
                splitArea: {show: false},
                data: label
            }],
            yAxis: [{
                type: 'value',
                min: yMin,
                max: yMax,
                axisLine: {
                    lineStyle: {
                        color: '#b6b6b6'
                    }
                },
                axisLabel: {
                    formatter: yAxisLabelFormatter ? yAxisLabelFormatter : '{value}' + yAxisUnit,
                    textStyle: {color: '#5f5f5f'},
                    margin: 15
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#e5e5e5'
                    }
                },
                splitArea: {show: false}
            }],
            series: this.state.series
        };
    }

    renderChart (){
        this._chartInstance = echarts.init(this.chartWrapper);
        this._chartInstance.setOption(this.generateOption(this.state));
    }

    updateChart (data){
        this._chartInstance.setOption(this.generateOption(data));
    }

    resizeChart (){
        this.timer && clearTimeout(this.timer);
        let {resizeDelay} = this.state;
        // should do it after all animations that will affect the width calculation are done
        this.timer = setTimeout(this._chartInstance.resize, resizeDelay);
    }

    render() {
        return (
            <div
                className="fs-chart-content"
                style={{width: this.state.width, height: this.state.height, marginTop: 15}}
                ref={chartWrapper => this.chartWrapper = chartWrapper}
            >
                Sorry, your browser does not support canvas, so please replace it with modern browsers that support HTML5 standards.
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {main: {menuExpand}} = state;
    return {menuExpand};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

export default connect(mapStateToProps, {}, mergeProps)(FSLineChart);