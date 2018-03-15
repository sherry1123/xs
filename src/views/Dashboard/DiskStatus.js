// DiskStatus 磁盘状态
import React, { Component } from 'react';
import { connect } from 'react-redux';
// import lang from '../../components/Language/lang';
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/title'
class DiskStatus extends Component {
  /**
   * 初始化id id是随机生成的一串唯一的字符串
   */
  constructor(props) {
    super(props)
    let id = ('_' + Math.random()).replace('.', '_');
    let myChart ;
    let {menuExpand} = this.props;
    let data = [
      { value: 335, name: '剩余' },
      { value: 310, name: '使用' },
      { value: 274, name: '健康' },
      { value: 235, name: '不可用' }
    ];
    let option = null;
    option = {
      backgroundColor: '#fff',
      title: {
        text: '硬盘状态',
        left: 'left',
        top: 3,
        textStyle: {
          color: '#000'
        }
      },
      data: data,
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        top: '28%',
        left: '65%',
        icon: 'circle',
        data: data,
        textStyle: {
          color: 'auto'
        },
        formatter: function (params) {
          let total = 0;
          let percent = 0;
          let tarValue = 0;
          for (let i = 0; i < data.length; i++) {
            total += data[i].value;
            if (data[i].name === params) {
              tarValue = data[i].value;
            }
          };
          percent = ((tarValue / total) * 100).toFixed(2);
          // console.log(percent)
          return params + ' ' + percent + '%';
        }
      },
      // visualMap: {
      //   show: false,
      //   min: 80,
      //   max: 600,
      //   inRange: {
      //     colorLightness: [0, 1]
      //   }
      // },
      series: [
        {
          name: '硬盘状态',
          type: 'pie',
          radius: '55%',
          center: ['35%', '50%'],
          color: ['#49dff0', '#034079', '#6f81da', '#00ffb4'],
          data: [
            { value: 335, name: '剩余' },
            { value: 310, name: '使用' },
            { value: 274, name: '健康' },
            { value: 235, name: '不可用' }
          ].sort(function (a, b) { return a.value - b.value; }),
          roseType: 'radius',
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
          itemStyle: {
            color: ['#49dff0', '#034079', '#6f81da', '#00ffb4'],
            normal: {
              // color: '#c23531',
              shadowBlur: 200,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },

          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return Math.random() * 200;
          }
        }
      ]
    };
    this.state = {
      pieId: 'pie' + id,
      menuExpand,
      data ,
      option,
      myChart
    }
  }
  initPie(id) {
    // let _myChart = this.state.myChart;
    this._myChart = echarts.init(document.getElementById(id));
    this._myChart.setOption(this.state.option)
    console.log('initPie  开始初始化 Pie')
  }

  componentDidMount() {
    this.initPie(this.state.pieId);
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
      <div id={this.state.pieId} style={{ width: "100%", height: "100%" }}>

      </div>
    )
  }

}

const mapStateToProps = state => {
  const { language  } = state;
  return { language};
};

export default connect(mapStateToProps)(DiskStatus);