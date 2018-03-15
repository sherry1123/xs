// EventMonitor 事件监视器
import React, { Component } from 'react';
import { connect } from 'react-redux';
// import lang from '../../components/Language/lang';
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/title'
// import config from './chart.config.js'
class EventMonitor extends Component {
  constructor(props) {
    super(props);
    let id = ('_' + Math.random()).replace('.', '_');
    let option = null;
    let _myChart ;
    option = {
      backgroundColor: "#344b58",
      "title": {
        "text": "事件监控",
        "subtext": "Event Monitor",


        textStyle: {
          color: '#fff',
          fontSize: '16'
        },
        subtextStyle: {
          color: '#90979c',
          fontSize: '10',

        },
      },
      "tooltip": {
        "trigger": "axis",
        "axisPointer": {
          "type": "shadow",
          textStyle: {
            color: "#fff"
          }

        },
      },
      "grid": {
        "borderWidth": 0,
        "top": 110,
        "bottom": 95,
        textStyle: {
          color: "#fff"
        }
      },
      "legend": {
        x: '4%',
        top: '11%',
        textStyle: {
          color: '#90979c',
        },
        "data": [ '男']
      },


      "calculable": true,
      "xAxis": [{
        "type": "category",
        "axisLine": {
          lineStyle: {
            color: '#90979c'
          }
        },
        "splitLine": {
          "show": false
        },
        "axisTick": {
          "show": false
        },
        "splitArea": {
          "show": false
        },
        "axisLabel": {
          "interval": 0,

        },
        "data": [],
      }],
      "yAxis": [{
        "type": "value",
        "splitLine": {
          "show": false
        },
        "axisLine": {
          lineStyle: {
            color: '#90979c'
          }
        },
        "axisTick": {
          "show": false
        },
        "axisLabel": {
          "interval": 0,

        },
        "splitArea": {
          "show": false
        },

      }],
      "series": [

        {
          "name": "男",
          "type": "bar",
          "stack": "总量",
          "itemStyle": {
            "normal": {
              "color": "rgba(0,191,183,1)",
              "barBorderRadius": 0,
              "label": {
                "show": true,
                "position": "top",
                formatter: function (p) {
                  return p.value > 0 ? (p.value) : '';
                }
              }
            }
          },
          "data": [
            327,
            1776,
            507,
            1200,
            800,
            482,
            204,
            1390,
            1001,
            951,
            381,
            220
          ]
        }
      ]
    }
    this.state = {
      lineId: 'line' + id,
      option,
      _myChart
    }
  }
  initPie(id) {
    // let _myChart = this.state.myChart;
    this._myChart = echarts.init(document.getElementById(id));
    this._myChart.setOption(this.state.option)
    console.log('initPie  开始初始化 Pie')
  }

  componentDidMount() {
    this.initPie(this.state.lineId);
    window.addEventListener('resize', this.resizeChart.bind(this));
    
  }

  resizeChart (){
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(this._myChart.resize, 300);

  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeChart.bind(this));
    // console.log('componentDidMount')
  }
  render() {
    return (
      <div id={this.state.lineId} style={{ width: "100%", height: "100%" }}>

      </div>
    )
  }
}

const mapStateToProps = state => {
  const { language } = state;
  return { language };
};

export default connect(mapStateToProps)(EventMonitor);