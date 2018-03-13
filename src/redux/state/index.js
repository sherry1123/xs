export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        metadataServerIPs: [
            '192.168.100.100'
        ],
        storageServerIPs: [
            '192.168.100.110'
        ],
        clientIPs: [
            '192.168.100.120'
        ],
        managementServerIPs: [
            '192.168.100.130'
        ],
        enableHA: false,
        floatIPs: [
            '192.168.100.140'
        ],
        hbIPs: [
            '192.168.100.150',
            '192.168.100.151'
        ],
    },

    // login
    login: {

    },

    // logged
    main: {
        // general
        activeMenu: [],
        activePage: '',
        menuExpand: true,
        // login user
        userInfo: {
            name: 'admin'
        },
        // metadata nodes
        metadataNodes: {
            overview: {
                nodes: [
                    {name: 'ClusterMe1',id: 'cm1',up: true},
                    {name: 'ClusterMe2',id: 'cm2',up: true},
                    {name: 'ClusterMe3',id: 'cm3',up: true},
                ],
            },
            detail: {

            }
        },
        // storage nodes
        storageNodes: {
            overview: {
                diskStatus: {
                    totalCapacity: 99999999999999,
                    usedCapacity: 39000000000000,
                    remainingCapacity: 60999999999999,
                },
                nodes: [
                    {name: 'ClusterSt1',id: 'cs1',up: true},
                    {name: 'ClusterSt2',id: 'cs2',up: true},
                    {name: 'ClusterSt3',id: 'cs3',up: false},
                    {name: 'ClusterSt4',id: 'cs4',up: true},
                ],
                throughput : [],
            },
            detail: {
                status: {},
                targetList: [
                    {id: 'target_1', path: '/dev/orca_t1', totalDiskCapacity: 999999999, usedDiskCapacity: 899999999, remainingDiskCapacity: 100000000},
                    {id: 'target_2', path: '/dev/orca_t2', totalDiskCapacity: 599999999, usedDiskCapacity: 299999999, remainingDiskCapacity: 300000000},
                    {id: 'target_3', path: '/dev/orca_t3', totalDiskCapacity: 899999999, usedDiskCapacity: 199999999, remainingDiskCapacity: 700000000},
                ]
            }
        },
        // stripe
        stripeInformation: {
            path: '/opt/xxx/ada',
            defaultTargetNumber: 1,
            blockSize: 1024,
            stripeMode: 'buddyMirror',
            isMetadataImage: true,
        },
        // file list
        fileList: [
            {name: '/opt/',portal: 'aaa',permission: 'admin',user: 'admin1',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:40:28.921Z',lastAccessTime: '2018-01-26T04:02:28.921Z'},
            {name: '/opt/dev/h',portal: 'aaa',permission: 'admin',user: 'admin2',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:33:28.921Z',lastAccessTime: '2018-01-26T04:33:28.921Z'},
            {name: '/opt/dev/a',portal: 'aaa',permission: 'admin',user: 'admin2',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:12:28.921Z',lastAccessTime: '2018-01-26T04:12:28.921Z'},
            {name: '/opt/gk',portal: 'aaa',permission: 'admin',user: 'admin3',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:44:28.921Z',lastAccessTime: '2018-01-26T04:55:28.921Z'},
        ],
    }
}