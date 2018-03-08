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
      name: '可恢复'
    }, {
      value: 3854,
      name: '健康'
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
        // padding: [5, 4],
        // align: 'center'
      },
      total: {
        color: "#ffc72b",
        fontSize: 10 * scale,
        align: 'center'
      },
      white: {
        // color: "#aaa",
        align: 'center',
        fontSize: 10 * scale,
        // padding: [10, 0],
        
      },
      // hr: {
      //   borderColor: '#0b5263',
      //   width: '100%',
      //   borderWidth: 1,
      //   height: 0,
      // }
    }
    let total = 0; 
    echartData.forEach(function (value, index, array) {
      total += value.value;
    });
    option = {
      backgroundColor: '#fff',
      title: {
        text: '硬盘容量',
        subtext:total+'MiB',
        // left: 'center',
        top: '49%',
        // padding: [25, 0],
        // center: ['15%', '50%'],
        left:'23.4%',
        textStyle: {
          color: '#aaa',
          fontSize: 12 * scale,
          // align: 'center'
        },
      },
      legend: {
        orient: 'vertical',
        top: '41%',
        left: '60%',
        icon: 'circle',
        data:echartData,
        textStyle: {
          color: 'auto'
        },
        formatter: function (params) {
          // let total = 0; 
          let percent = 0; 
          let tarValue = 0;
          for(let i = 0;i<echartData.length;i++){
            // total += echartData[i].value;
            if(echartData[i].name===params){
              tarValue = echartData[i].value;
            }
          };
          percent = ((tarValue / total) * 100).toFixed(2);
          console.log(percent)
          return params + ' ' + percent + '%';
        },

      },
      series: [{
        name: '硬盘容量',
        type: 'pie',
        radius: ['42%', '50%'],
        center: ['31%', '60%'],
        hoverAnimation: true,
        data: echartData.sort(function (a, b) { return a.value - b.value; }),
        tooltip: {
          show: true
        },
        color: ['#c487ee', '#deb140', '#49dff0', '#034079', '#6f81da', '#00ffb4'],
        label: {
          normal: {
            textStyle: {
              // color: 'red'
            }
          }
        },
        labelLine: {
          normal: {
            lineStyle: {
              color: '#000'
            },
            smooth: 0.2,
            length: 10,
            length2: 10
          }
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        }
        
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