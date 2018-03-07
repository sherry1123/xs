export default {
    chartProps1 : {
        height: 200,
        y: 10,
        label: [
            1520316406173 , 1520316506173 , 1520316606173, 1520316706173, 1520316806173, 1520316906173, 1520317006173, 1520317106173, 1520317206173, 1520317306173, 1520317406173, 1520317506173,
            1520317606173 , 1520317706173 , 1520317806173, 1520317906173, 1520318006173, 1520318106173, 1520318206173, 1520318306173, 1520318406173, 1520318506173, 1520318606173, 1520318706173,
            1520318806173 , 1520318906173 , 1520319006173, 1520319106173, 1520319206173, 1520319306173, 1520319406173, 1520319506173, 1520319606173, 1520319706173, 1520319806173, 1520319906173,
            1520320006173 , 1520320106173 , 1520320206173, 1520320306173, 1520320406173, 1520320506173, 1520320606173, 1520320706173, 1520320806173, 1520320906173, 1520321006173, 1520321106173
        ],
        series: [{
            name: 'Throughput',
            type: 'line',
            itemStyle: {
                normal: {
                    color: '#45ccce',
                    lineStyle: {
                        width: 1
                    }
                }
            },
            data: [
                12, 20, 20, 50, 15 , 20, 20, 11 , 700, 23, 24 , 25,
                12, 100 , 11, 12, 11 , 13, 655, 20 , 11, 21, 7 , 10,
                10, 12 , 7, 13, 9, 800, 20, 18 , 12, 10, 650 , 12,
                11, 8 , 200, 13, 9, 14, 22, 9 , 754, 10, 11 , 12
            ]
        }]
    },

    chartProps2: {
        height: 200,
        y: 10,
        label: [
            1520316406173 , 1520316506173 , 1520316606173, 1520316706173, 1520316806173, 1520316906173, 1520317006173, 1520317106173, 1520317206173, 1520317306173, 1520317406173, 1520317506173,
            1520317606173 , 1520317706173 , 1520317806173, 1520317906173, 1520318006173, 1520318106173, 1520318206173, 1520318306173, 1520318406173, 1520318506173, 1520318606173, 1520318706173,
            1520318806173 , 1520318906173 , 1520319006173, 1520319106173, 1520319206173, 1520319306173, 1520319406173, 1520319506173, 1520319606173, 1520319706173, 1520319806173, 1520319906173,
            1520320006173 , 1520320106173 , 1520320206173, 1520320306173, 1520320406173, 1520320506173, 1520320606173, 1520320706173, 1520320806173, 1520320906173, 1520321006173, 1520321106173
        ],
        series: [{
            name: 'Throughput',
            type: 'line',
            itemStyle: {
                normal: {
                    color: '#f79f07',
                    lineStyle: {
                        width: 1
                    }
                }
            },
            data: [
                11, 8 , 200, 13, 9, 14, 22, 9 , 754, 10, 11 , 12,
                10, 12 , 7, 13, 9, 800, 20, 18 , 12, 10, 650 , 12,
                12, 100 , 11, 12, 11 , 13, 655, 20 , 11, 21, 7 , 10,
                12, 20, 20, 50, 15 , 20, 20, 11 , 700, 23, 24 , 25,
            ]
        }]
    },

    chartProps3: {
        height: 180,
        series: [{
            name: '磁盘容量',
            type: 'pie',
            color: ['#f6b93f', '#47d45b'],
            legend: {
                data: ['Used Disk Capacity', 'RemainingDiskCapacity']
            },
            data: [
                {value: 39999999999, name: 'UsedDiskCapacity'},
                {value: 60000000000, name: 'RemainingDiskCapacity'},
            ]
        }]
    }
}