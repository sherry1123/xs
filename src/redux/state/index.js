export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        // step 1 role definition
        metadataServerIPs: ['192.168.100.48',],
        storageServerIPs: ['192.168.100.49'],
        clientIPs: ['192.168.100.101'],
        managementServerIPs: ['192.168.100.101'],
        enableHA: false,
        floatIPs: ['192.168.100.140'],
        hbIPs: ['192.168.101.98','192.168.101.99'],
        // step 3 RAID configuration
        enableRAID: true,
        enableCustomRAID: false,
        recommendedRAID:  {
            metadataServerIPs: {
                /*
                '192.168.100.48': [
                    {
                        raidLevel: 5,
                        diskList: [
                            { diskName: '/dev/nvme0n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme1n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme2n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme3n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme4n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme5n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme6n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme7n1', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 8,
                        stripeSize: 1024 * 8,
                        diskType: 'ssd'
                    },
                    {
                        raidLevel: 5,
                        diskList: [
                            { diskName: '/dev/nvme8n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme9n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme10n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme11n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme12n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme13n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme14n1', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/nvme15n1', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 8,
                        stripeSize: 1024 * 8,
                        diskType: 'ssd'
                    }
                ],
                */
            },
            storageServerIPs: {
                /*
                '192.168.100.49': [
                    {
                        raidLevel: 1,
                        diskList: [
                            { diskName: '/dev/sdb', space: 1024 * 1024 * 1024 * 400 },
                            { diskName: '/dev/sdc', space: 1024 * 1024 * 1024 * 400 }
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 2,
                        stripeSize: 1024 * 8,
                        diskType: 'hdd'
                    }
                ]
                */
            }
        },
        customRAID: {},
        enableCreateBuddyGroup: false,
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
        // dashboard and services, common data of the entire cluster
        dashboard: {
            clusterStatus: {status: true, total: 0, normal: 0, abnormal: 0},
            clusterCapacity: {total: 0, used: 0, free: 0, usage: '--'},
            clusterTargets: [],
            clusterTPS: {total: [], time: []},
            clusterIOPS: {total: [], time: []},
            clusterPhysicalNodeList: [],
            clusterServiceAndClientIPs: {metadataServerIPs: [], storageServerIPs: [], managementServerIPs: [], clientIPs: []},
            // for add metadata or storage service
            customRAIDList: [],
        },
        // data node, informations on a physical node
        dataNode: {
            currentPhysicalNode: {},
            physicalNodeInfo: {status: true, service: {metadata: 0, storage: 0}},
            physicalNodeTargets: [],
            physicalNodeCPU: {total: [], time: []},
            physicalNodeRAM: {total: [], time: []},
            physicalNodeTPS: {read: [], write: [], time: []},
            physicalNodeIOPS: {total: [], time: []},
        },
        // snapshot, timed snapshot schedule and setting
        snapshot: {
            snapshotSetting: {total: 0, auto: 0, manual: 0,},
            snapshotList: [],
            snapshotScheduleList: [],
        },
        // NAS server, NFS share and client, CIFS share
        share: {
            NASServerList: [],
            clientListForNASServer: [],
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
        // target and buddy group
        target: {
            targetList: [],
            buddyGroupList: [],
        },
        // system log, event logs contains only error actions, audit logs contains all actions
        systemLog: {
            eventLogs: [],
            auditLogs: [],
        },
    }
}