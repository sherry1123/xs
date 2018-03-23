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
            '192.168.101.98',
            '192.168.101.99'
        ],
    },

    // login
    login: {

    },

    // logged
    main: {
        // general
        general: {
            version: '',
            user: {
                username: 'admin'
            },
            activeMenu: [],
            activePage: '',
            menuExpand: true,
        },
        // metadata nodes
        metadataNode: {
            overview: {
                status: [
                    /*
                    {node: 'ClusterMe1', nodeNumID: 'cm1', value: true},
                    {node: 'ClusterMe2', nodeNumID: 'cm2', value: true},
                    {node: 'ClusterMe3', nodeNumID: 'cm3', value: false},
                    */
                ],
                general: [],
                userOperationStatics: []
            },
            detail: {
                general: [],
                userOperationStatics: []
            }
        },
        // storage nodes
        storageNode: {
            overview: {
                status: [
                    /*
                    {node: 'ClusterMe1', nodeNumID: 'cm1', value: true},
                    {node: 'ClusterMe2', nodeNumID: 'cm2', value: true},
                    {node: 'ClusterMe3', nodeNumID: 'cm3', value: false},
                    */
                ],
                diskSpace: {
                    diskSpaceTotal: 99999999999999,
                    diskSpaceUsed: 39000000000000,
                    diskSpaceFree: 60999999999999,
                },
                overviewThroughput: {
                    read: [],
                    write: [],
                    sum: [],
                    time: [] // for x-axis
                },
            },
            detail: {
                general: {},
                storageTargets: [
                    {id: '201', pathStr: '/dev/orca_201', diskSpaceTotal: 999999999, diskSpaceUsed: 899999999, diskSpaceFree: 100000000},
                    {id: '202', pathStr: '/dev/orca_202', diskSpaceTotal: 599999999, diskSpaceUsed: 299999999, diskSpaceFree: 300000000},
                    {id: '203', pathStr: '/dev/orca_203', diskSpaceTotal: 899999999, diskSpaceUsed: 199999999, diskSpaceFree: 700000000},
                ],
                detailThroughput: {
                    read: [],
                    write: [],
                    sum: [],
                    time: [] // for x-axis
                },
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