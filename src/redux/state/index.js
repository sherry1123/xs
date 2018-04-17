export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        // step 1 role define
        metadataServerIPs: ['192.168.100.101'],
        storageServerIPs: ['192.168.100.101'],
        clientIPs: ['192.168.100.101'],
        managementServerIPs: ['192.168.100.101'],
        enableHA: false,
        floatIPs: ['192.168.100.140'],
        hbIPs: ['192.168.101.98','192.168.101.99'],
        // step 3 RAID configuration
        enableRAID: false,
        RAIDConfig: {},
        // start initialization
        initStatus: {current: 0, total: 0, status: 0},
        // init finished
        defaultUser: {username: '--', password: '--'},
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
                nodeList: [
                    /*
                    {node: 'ClusterMe1', nodeNumID: 'cm1', value: true},
                    {node: 'ClusterMe2', nodeNumID: 'cm2', value: true},
                    {node: 'ClusterMe3', nodeNumID: 'cm3', value: false},
                    */
                ],
                // general: [],
                statics: []
            },
            detail: {
                // general: [],
                statics: []
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
                    {id: '204', pathStr: '/dev/orca_204', diskSpaceTotal: 699999999, diskSpaceUsed: 199999999, diskSpaceFree: 500000000},
                    {id: '205', pathStr: '/dev/orca_205', diskSpaceTotal: 799999999, diskSpaceUsed: 199999999, diskSpaceFree: 600000000},
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
        // snapshot
        snapshot: {
            snapshotList: [
                /*
                {name: 'snapshot3', isAuto: false, createTime: 1522761568579},
                {name: 'snapshot2', isAuto: false, createTime: 1522754568579},
                {name: 'snapshot1', isAuto: false, createTime: 1522750568579},
                {name: 'test-20180413095300', isAuto: true, createTime: 1522750868579},
                */
            ],
            snapshotScheduleList: [

            ]
        },
        // share
        share: {
            shareList: [
                /*
                {protocol: 'NFS', path: '/test/a', description: 'xxxx'},
                {protocol: 'CIFS', path: '/test', description: 'xxxx'},
                */
            ]
        },
        // file system operation
        // stripe
        fsOperation: {
            entryInfo: {
                dirPath: '/',
                numTargets: 0,
                chunkSize: 0,
                buddyMirror: 1,
                // isMetadataImage: true,
            },
            // file list
            files: [
                /*
                {isDir: true,name: 'opt',size: 2,permissions: 'drwxr-xr-x',user: 'admin1',group: 'root',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:40:28.921Z',lastAccessTime: '2018-01-26T04:02:28.921Z'},
                {isDir: true,name: 'opt1',size: 0,permissions: 'drwxr-xr-x',user: 'admin2',group: 'root',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:33:28.921Z',lastAccessTime: '2018-01-26T04:33:28.921Z'},
                {isDir: true,name: 'opt2',size: 0,permissions: 'drwxr-xr-x',user: 'admin1',group: 'root',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:40:28.921Z',lastAccessTime: '2018-01-26T04:02:28.921Z'},
                {isDir: false,name: 'abc',size: '4.00 Byte',permissions: 'drwxr-xr-x',user: 'admin1',group: 'root',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:40:28.921Z',lastAccessTime: '2018-01-26T04:02:28.921Z'},
                */
            ],
        }
    }
}