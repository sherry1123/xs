// CpacityUsage 容量使用


import React, { Component } from 'react';
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/title'
export default class CpacityUsage extends Component {


  /**
   * 初始化id id是随机生成的一串唯一的字符串
   */
  constructor(props) {
    super(props)
    let id = ('_' + Math.random()).replace('.', '_');
    this.state = {
      pieId: 'pie' + id,
    }
    this.resize = this.resize.bind(this);
  }
  /**
   * 生成图表，主要做了一个判断，因为如果不去判断dom有没有生成，
   * 在后面如果定期去更新图表，每次生成一个dom节点会导致浏览器
   * 占用的cpu和内存非常高，踩过坑。
   */
  initPie(id) {
    let option = null;
    let scale = 1;
    let echartData = [{
      value: 2154,
      name: '健康'
    }, {
      value: 3854,
      name: '可恢复'
    }, {
      value: 3515,
      name: '不可恢复'
    }, {
      value: 3515,
      name: '降级'
    }, {
      value: 3854,
      name: '不可能'
    }]
    let rich = {
      yellow: {
        color: "#ffc72b",
        fontSize: 10 * scale,
        padding: [5, 4],
        align: 'center'
      },
      total: {
        color: "#ffc72b",
        fontSize: 10 * scale,
        align: 'center'
      },
      white: {
        color: "#fff",
        align: 'center',
        fontSize: 10 * scale,
        padding: [10, 0],
        
      },
      hr: {
        borderColor: '#0b5263',
        width: '100%',
        borderWidth: 1,
        height: 0,
      }
    }
    option = {
      backgroundColor: '#031f2d',
      title: {
        text: '硬盘状态',
        left: 'center',
        top: '35%',
        padding: [25, 0],
        textStyle: {
          color: '#fff',
          fontSize: 12 * scale,
          align: 'center'
        }
      },
      legend: {
        selectedMode: false,
        formatter: function (name) {
          let total = 0; //各科正确率总和
          let averagePercent; //综合正确率
          echartData.forEach(function (value, index, array) {
            total += value.value;
          });
          return '{total|' + total + '}';
        },
        data: [echartData[0].name],
        // data: ['高等教育学'],
        // itemGap: 50,
        left: 'center',
        top: 'center',
        icon: 'none',
        align: 'center',
        textStyle: {
          rich: rich
        },
      },
      series: [{
        name: '总考生数量',
        type: 'pie',
        radius: ['42%', '50%'],
        hoverAnimation: false,
        color: ['#c487ee', '#deb140', '#49dff0', '#034079', '#6f81da', '#00ffb4'],
        label: {
          normal: {
            formatter: function (params, ticket, callback) {
              let total = 0; //考生总数量
              let percent = 0; //考生占比
              echartData.forEach(function (value, index, array) {
                total += value.value;
              });
              percent = ((params.value / total) * 100).toFixed(1);
              return '{white|' + params.name + '}\n{hr|}\n{yellow|' + params.value +'MiB '+percent+'%'+ '}\n{blue|' +'}';
            },
            rich: rich
          },
        },
        labelLine: {
          normal: {
            length:1*scale,
            lineStyle: {
              color: '#0b5263'
            }
          }
        },
        data: echartData
      }]
    };
    let myChart = echarts.getInstanceByDom(document.getElementById(id));
    // let myChart = echarts.getInstanceByDom(document.getElementById(id));
    if (myChart === undefined) {
      myChart = echarts.init(document.getElementById(id));
    }
    myChart.setOption(option)
    window.onresize = () => {
      //自适应容器窗口变化  
      // console.log('ssssss')
      myChart.resize();
    }
  }
  resize(){
    this.initPie(this.state.pieId);
    // console.log('state')
  }

  componentDidMount() {
    /**
     * 在这里去调用生成图表的方法是因为，在组件加载后生成
     * dom节点，这个时候canvas才能根据id去绘制图表
     */
    this.initPie(this.state.pieId);
    // window.addEventListener('resize', this.resize)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }
  render() {
    return (

      <div id={this.state.pieId} style={{ width: "100%", height: "100%" }}>

      </div>
    )
  }
}