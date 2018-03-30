export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        // step 1 role define
        metadataServerIPs: ['192.168.100.100', '192.168.100.101'],
        storageServerIPs: ['192.168.100.110', '192.168.100.111'],
        clientIPs: ['192.168.100.120'],
        managementServerIPs: ['192.168.100.130'],
        enableHA: false,
        floatIPs: ['192.168.100.140'],
        hbIPs: ['192.168.101.98','192.168.101.99'],
        // step 3 RAID configuration
        enableRAID: false,
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
            knownProblems: [
                {type: '', node: '', reason: ''},
            ]
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
                    diskSpaceTotal: 0,
                    diskSpaceUsed: 0,
                    diskSpaceFree: 0,
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
                    /*
                    {id: '201', pathStr: '/dev/orca_201', diskSpaceTotal: 999999999, diskSpaceUsed: 899999999, diskSpaceFree: 100000000},
                    {id: '202', pathStr: '/dev/orca_202', diskSpaceTotal: 599999999, diskSpaceUsed: 299999999, diskSpaceFree: 300000000},
                    {id: '203', pathStr: '/dev/orca_203', diskSpaceTotal: 899999999, diskSpaceUsed: 199999999, diskSpaceFree: 700000000},
                    */
                ],
                detailThroughput: {
                    read: [],
                    write: [],
                    sum: [],
                    time: [] // for x-axis
                },
            }
        },
        // management
        management: {
            eventLogs: [
                /*
                {id: '5ab227d44931085aa45f9f89', node: 'xxx', desc: 'xxx0', level: 1, time: Date.now()},
                {id: '5ab227f14931085aa45f9f8b', node: 'xxx', desc: 'xxx1', level: 3, time: Date.now()},
                */
            ],
            auditLogs: [
                /*
                {id: '5ab3680fe9f28fe2c978109e', username: 'xxx', desc: 'xxx', desc: 'xxx0', ip: 'xxx', time: Date.now(),},
                {id: '5ab301acd1fc4871e88e8e7f',username: 'xxx', desc: 'xxx', desc: 'xxx1', ip: 'xxx', time: Date.now(),},
                */
            ],
        },
        // file system operation
        // stripe
        fsOperation: {
            stripe: {
                dirPath: '/dev/orcafs',
                numTargets: 5,
                chunkSize: 1024,
                buddyMirror: 1,
                // isMetadataImage: true,
            },
            // file list
            fileList: [
                {name: '/opt/',portal: 'aaa',permission: 'admin',user: 'admin1',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:40:28.921Z',lastAccessTime: '2018-01-26T04:02:28.921Z'},
                {name: '/opt/dev/h',portal: 'aaa',permission: 'admin',user: 'admin2',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:33:28.921Z',lastAccessTime: '2018-01-26T04:33:28.921Z'},
                {name: '/opt/dev/a',portal: 'aaa',permission: 'admin',user: 'admin2',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:12:28.921Z',lastAccessTime: '2018-01-26T04:12:28.921Z'},
                {name: '/opt/gk',portal: 'aaa',permission: 'admin',user: 'admin3',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:44:28.921Z',lastAccessTime: '2018-01-26T04:55:28.921Z'},
                {name: '/opt/d',portal: 'aaa',permission: 'admin',user: 'admin1',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:40:28.921Z',lastAccessTime: '2018-01-26T04:02:28.921Z'},
            ],
        }
    }
}