import React, {Component} from 'react';
import {connect} from "react-redux";
import echarts from 'echarts';
import moment from 'moment';

class FSLineChart extends Component {
    constructor(props) {
        super(props);
        let {menuExpand, option: {title, width = '100%', height = '100%', x = 90, y = 50, yAxisUnit = '', yMin = null, yMax = null, formatterFn = '', legend = [], label, series}} = this.props;
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
            formatterFn,
            legend,
            label: label.map(label => {
                return moment(new Date(label)).format('HH:mm:ss');
            }),
            series: series.map(series => {
                if (series.type === 'line') {
                    // curve smoothing
                    series['smooth'] = true;
                    // show all symbol
                    series['showAllSymbol'] = false;
                    series['symbolSize'] = 0;
                }
                return series;
            })
        };
    }

    componentDidMount() {
        this.renderChart();
        window.addEventListener('resize', this.resizeChart.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeChart.bind(this));
    }

    async componentWillReceiveProps(nextProps) {
        let {menuExpand, option: {label, series, title}} = nextProps;
        await this.setState({
            label: label.map(label => {
                // format 'Wed Aug 16 2017 21:24:26 GMT+0800 (CST)' to '21:24:26'
                return moment(new Date(label)).format('HH:mm:ss');
            }),
            series: series.map(series => {
                if (series.type === 'line') {
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
        if (menuExpand !== this.state.menuExpand) {
            this.resizeChart();
        }
        this.setState({menuExpand});
    }

    generateOption({title, label, x, y, formatterFn, yAxisUnit, yMin, yMax, legend}) {
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
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#c0d0e0',
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
                }
            },
            legend,
            grid: {
                x: x, y: y,
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
                type: 'value',
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
                splitArea: {show: false}
            }],
            series: this.state.series
        };
    }

    renderChart() {
        this._chartInstance = echarts.init(this.chartWrapper);
        this._chartInstance.setOption(this.generateOption(this.state));
    }

    updateChart(data) {
        this._chartInstance.setOption(this.generateOption(data));
    }

    resizeChart() {
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(this._chartInstance.resize, 300);

    }

    render() {
        return (
            <div className="fs-chart-content" style={{width: this.state.width, height: this.state.height + 'px'}}
                 ref={chartWrapper => this.chartWrapper = chartWrapper}>
                Sorry, your browser does not support canvas,
                so please replace it with modern browsers that support HTML5 standards.
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