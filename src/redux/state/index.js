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
        enableRAID: true,
        RAIDConfig: {},
        // start initialization
        initStatus: {current: 0, total: 0, status: 0},
        // init finished
        defaultUser: {username: '--', password: '--'},
    },

    // login
    login: {
        // ?
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
                nodeList: [
                    /*
                    {node: 'ClusterMe1', nodeNumID: 'cm1', value: true},
                    {node: 'ClusterMe2', nodeNumID: 'cm2', value: true},
                    {node: 'ClusterMe3', nodeNumID: 'cm3', value: false},
                    */
                ],
                diskSpace: {
                    total: 0,
                    used: 0,
                    free: 0,
                },
                overviewThroughput: {
                    read: [],
                    write: [],
                    total: [],
                    time: [] // for x-axis
                },
            },
            detail: {
                storageTargets: [
                    /*
                    {targetId: '201', storagePath: '/dev/orca_201', totalSpace: 999999999, usedSpace: 899999999, freeSpace: 100000000},
                    {targetId: '202', storagePath: '/dev/orca_202', totalSpace: 599999999, usedSpace: 299999999, freeSpace: 300000000},
                    {targetId: '203', storagePath: '/dev/orca_203', totalSpace: 899999999, usedSpace: 199999999, freeSpace: 700000000},
                    {targetId: '204', storagePath: '/dev/orca_204', totalSpace: 699999999, usedSpace: 199999999, freeSpace: 500000000},
                    {targetId: '205', storagePath: '/dev/orca_205', totalSpace: 799999999, usedSpace: 199999999, freeSpace: 600000000},
                    */
                ],
                detailThroughput: {
                    read: [],
                    write: [],
                    total: [],
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

            ],
            snapshotSetting: {
                total: 0,
                auto: 0,
                manual: 0,
            }
        },
        // NFS and CIFS share
        share: {
            NFSList: [
                {path: '/a/a1', description: 'yyyyy'},
                {path: '/a/a2', description: 'xxxxx'},
            ],
            CIFSList: [
                {name: 'cifs_share_01', path: '/b/b1', description: 'yyyyy'},
                {name: 'cifs_share_02', path: '/b/b2', description: 'xxxxx'},
            ],
        },
        // authenticated local user and group for CIFS share
        localUser: {
            localUserList: [

            ],
            localGroupList: [

            ],
        },
    }
}