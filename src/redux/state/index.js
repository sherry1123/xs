export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        // step 1 role definition
        metadataServerIPs: ['192.168.100.48', '192.168.100.49'],
        storageServerIPs: ['192.168.100.50'],
        clientIPs: ['192.168.100.101'],
        managementServerIPs: ['192.168.100.101'],
        enableHA: false,
        floatIPs: ['192.168.100.140'],
        hbIPs: ['192.168.101.98','192.168.101.99'],
        // step 3 RAID configuration
        enableRAID: true,
        RAIDConfig:  {
            metadataServerIPs: {
                '192.168.100.48': [
                    {
                        raidLevel: 5,
                        diskList: [
                            { path: '/dev/nvme0n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme1n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme2n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme3n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme4n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme5n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme6n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme7n1', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 8,
                        stripeSize: 1024 * 8,
                        diskType: 'ssd'
                    },
                    {
                        raidLevel: 5,
                        diskList: [
                            { path: '/dev/nvme8n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme9n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme10n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme11n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme12n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme13n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme14n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme15n1', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 8,
                        stripeSize: 1024 * 8,
                        diskType: 'ssd'
                    }
                ],
                '192.168.100.49': [
                    {
                        raidLevel: 5,
                        diskList: [
                            { path: '/dev/nvme0n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme1n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme2n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme3n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme4n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme5n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme6n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme7n1', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 8,
                        stripeSize: 1024 * 8,
                        diskType: 'sdd'
                    },
                    {
                        raidLevel: 5,
                        diskList: [
                            { path: '/dev/nvme8n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme9n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme10n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme11n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme12n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme13n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme14n1', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/nvme15n1', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 8,
                        stripeSize: 1024 * 8,
                        diskType: 'sdd'
                    }
                ]
            },
            storageServerIPs: {
                '192.168.100.50': [
                    {
                        raidLevel: 1,
                        diskList: [
                            { path: '/dev/sdb', space: 1024 * 1024 * 1024 * 400 },
                            { path: '/dev/sdc', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 2,
                        stripeSize: 1024 * 8,
                        diskType: 'hdd'
                    }
                ]
            }
        },
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