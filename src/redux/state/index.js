export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        // step 1 role definition
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
                nodeList: [],
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
                nodeList: [],
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
                storageTargets: [],
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
            eventLogs: [],
            auditLogs: [],
        },
        // snapshot
        snapshot: {
            snapshotList: [{name: '1'}, {name: '2'}],
            snapshotScheduleList: [],
            snapshotSetting: {total: 0, auto: 0, manual: 0,}
        },
        // NFS and CIFS share
        share: {
            NFSList: [],
            clientListOfNFS: [],
            CIFSList: [],
            localAuthUserOrGroupListOfCIFS: [],
        },
        // local authentication user and group for CIFS share
        localAuthUser: {
            localAuthUserList: [],
            localAuthUserGroupList: [],
            localAuthUserListOfGroup: [],
        },
    }
}