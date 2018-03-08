module.exports = {
  backgroundColor: '#fff',
  title: {
    text:'硬盘状态',
    left: 'left',
    top: 3,
    textStyle: {
      color: '#000'
    }
  },
  data:[
    { value: 335, name: '剩余' },
    { value: 310, name: '使用' },
    { value: 274, name: '健康' },
    { value: 235, name: '不可用' }
  ],
  tooltip: {
    trigger: 'item',
    formatter: "{a} <br/>{b} : {c} ({d}%)"
  },
  legend:{
    orient:'vertical',
    top:'28%',
    left:'65%',
    icon:'circle',
    data:[
      { value: 335, name: '剩余' },
      { value: 310, name: '使用' },
      { value: 274, name: '健康' },
      { value: 235, name: '不可用' }
    ],
    textStyle: {
      color: 'auto'
    },
    // formatter: function (params, ticket, callback) {
    // },
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
      color: [ '#49dff0', '#034079', '#6f81da', '#00ffb4'],
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
        color: [ '#49dff0', '#034079', '#6f81da', '#00ffb4'],
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