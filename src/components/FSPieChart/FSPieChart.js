import React, { Component } from 'react';
import echarts from 'echarts';

export default class FSPieChart extends Component {
<<<<<<< HEAD
  constructor(props) {
    super(props);
    let { option: { width = '100%', height = '100%', legend = {}, formatterFn = '', series } } = this.props;
    this.state = {
      width,
      height,
      formatterFn,
      legend,
      series: series.map(series => {
        series['radius'] = ['80%', '100%'];
        series['itemStyle'] = {
          normal: {
            label: {
              show: false
            }
          }
        };
        return series;
      })
    };
  }
=======
    constructor (props) {
        super(props);
        let {option: {title, width = '100%', height = '100%', legend = {}, series}} = this.props;
        this.state = {
            title,
            width,
            height,
            legend,
            series: this.makeSeries(series)
        };
    }

    makeSeries (series){
        let {option: {formatter = ''}} = this.props;
        return series.map(series => {
            series['radius'] = ['80%', '100%'];
            series['hoverAnimation'] = false;
            series['itemStyle'] = {
                normal: {
                    label: {
                        show: false
                    }
                }
            };
            series.data.forEach((data, i) => {
                data['itemStyle'] = {
                    normal : {
                        label: i === 0 && {
                            show: true,
                            position: 'center',
                            formatter,
                            textStyle: {
                                baseline : 'bottom'
                            }
                        },
                        labelLine: {
                            show: false
                        }
                    }
                };
            });
            return series;
        });
    }
>>>>>>> origin/dev

  componentDidMount() {
    this.renderChart();
    window.addEventListener('resize', this.resizeChart.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeChart.bind(this));
  }

<<<<<<< HEAD
  async componentWillReceiveProps(nextProps) {
    let { option: { series } } = nextProps;
    await this.setState({
      series: series.map(series => {
        series['radius'] = ['70%', '90%'];
        return series;
      })
    });
    this.updateChart(this.state);
  }

  generateOption({ legend }) {
    return {
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c} ({d}%)",
        backgroundColor: 'rgba(100, 100, 100, .7)',
        borderColor: '#333',
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data: legend.data
      },
      calculable: true,
      series: this.state.series
    };
  }
=======
    async componentWillReceiveProps(nextProps){
        let {option: {series}} = nextProps;
        await this.setState({
            series: this.makeSeries(series)
        });
        this.updateChart(this.state);
    }

    generateOption ({title, legend}){
        return {
            title,
            legend: {
                orient: 'vertical',
                x: 'left',
                data: legend.data
            },
            calculable: true,
            series: this.state.series
        };
    }
>>>>>>> origin/dev

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
      <div className="fs-chart-content" style={{ width: this.state.width, height: this.state.height + 'px' }}
        ref={chartWrapper => this.chartWrapper = chartWrapper}>
        Sorry, your browser does not support canvas,
        so please replace it with modern browsers that support HTML5 standards.
            </div>
    );
  }
}