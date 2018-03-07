// DiskStatus 磁盘状态

import React, { Component } from 'react';
import echarts from 'echarts/lib/echarts' 
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/title'
import config from './chart.config.js'
class DiskStatus extends Component {
  /**
   * 初始化id id是随机生成的一串唯一的字符串
   */
    constructor(props) {
      super(props)
      let id = ( '_' + Math.random()).replace('.','_');
      this.state = {
          pieId : 'pie' + id
      }
  }
  /**
   * 生成图表，主要做了一个判断，因为如果不去判断dom有没有生成，
   * 在后面如果定期去更新图表，每次生成一个dom节点会导致浏览器
   * 占用的cpu和内存非常高，踩过坑。
   * 这里的config就是引入的配置文件中的config,文件头部会有说明
   */
  initPie(id) {
      let myChart = echarts.getInstanceByDom(document.getElementById(id));
      // let myChart = echarts.getInstanceByDom(document.getElementById(id));
      if( myChart === undefined){ 
          myChart = echarts.init(document.getElementById(id));
      }
      myChart.setOption(config)
      window.onresize = () => {
        //自适应容器窗口变化  
        // console.log('ssssss')
        myChart.resize();
      }
  }
  componentDidMount() {
      /**
       * 在这里去调用生成图表的方法是因为，在组件加载后生成
       * dom节点，这个时候canvas才能根据id去绘制图表
       * 在这里去写了一个setTimeout修改了其中的一些数据，来
       * 测试图表的刷新，是否刷新了
       * 接口中获取数据，方法同理
       */                
      this.initPie(this.state.pieId);
      this.timer = setTimeout(()=>{
          config.series[0].data = [
              {value:335, name:'剩余'},
              {value:310, name:'使用'},
              {value:274, name:'健康'},
              {value:235, name:'不可用'}
          ].sort(function (a, b) { return a.value - b.value; })
          this.initPie(this.state.pieId);
      },1000*5)
  }
  componentWillUnmount() {
    // 清理计数器 防止占用内存
      this.timer && clearTimeout(this.timer);
  }
  render() {
      return (
        
          <div id={this.state.pieId} style={{width: "100%", height: "100%"}}>
             
          </div>
      )
  }

}
export default DiskStatus