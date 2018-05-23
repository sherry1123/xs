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
        // dashboard
        dashboard: {
            clusterStatus: {status: true, total: 0, normal: 0, abnormal: 0},
            clusterCapacity: {total: 0, used: 0, free: 0, usage: '--'},
            clusterTargets: [],
            clusterTPS: {total: [], time: []},
            clusterIOPS: {total: [], time: []},
            clusterPhysicalNodeList: [],
        },
        // data node
        dataNode: {
            currentPhysicalNode: {},
            physicalNodeInfo: {status: true, service: {metadata: 0, storage: 0}},
            physicalNodeTargets: [],
            physicalNodeCPU: {total: [], time: []},
            physicalNodeRAM: {total: [], time: []},
            physicalNodeTPS: {read: [], write: [], time: []},
            physicalNodeIOPS: {total: [], time: []},
        },
        // snapshot
        snapshot: {
            snapshotList: [],
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
        // management
        management: {
            eventLogs: [],
            auditLogs: [],
        },
        // local authentication user and group for CIFS share
        localAuthUser: {
            localAuthUserList: [],
            localAuthUserGroupList: [],
            localAuthUserListOfGroup: [],
        },
    }
}