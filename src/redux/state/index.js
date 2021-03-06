export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        // step 1 role definition
        metadataServerIPs: [''],
        storageServerIPs: [''],
        managementServerIPs: [''],
        enableHA: false,
        floatIPs: [''],
        hbIPs: ['', ''],
        clientIPs: [''],
        // step 3 RAID configuration
        enableRAID: true,
        enableCustomRAID: false,
        // for the recommendedRAID and customRAID below, their data structures are not the same because of some historical
        // reason: customRAID was done earlier, but recommendedRAID strategy gave out later, and implement with a different structure.
        recommendedRAID:  {
            metadataServerIPs: {
                /*
                '192.168.100.48': [
                    {
                        raidLevel: 5,
                        diskList: [
                            {diskName: '/dev/nvme0n1', space: 1024 * 1024 * 1024 * 400},
                            {diskName: '/dev/nvme1n1', space: 1024 * 1024 * 1024 * 400},
                            {diskName: '/dev/nvme2n1', space: 1024 * 1024 * 1024 * 400},
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 8,
                        stripeSize: 1024 * 8,
                        diskType: 'ssd'
                    },
                ],
                */
            },
            storageServerIPs: {
                /*
                '192.168.100.49': [
                    {
                        raidLevel: 1,
                        diskList: [
                            {diskName: '/dev/sdb', space: 1024 * 1024 * 1024 * 400},
                            {diskName: '/dev/sdc', space: 1024 * 1024 * 1024 * 400}
                        ],
                        totalSpace: 1024 * 1024 * 1024 * 400 * 2,
                        stripeSize: 1024 * 8,
                        diskType: 'hdd'
                    }
                ]
                */
            }
        },
        customRAID: {
            /*
            storageNodes: [
                {
                    type: 'storage',
                    ip: '192.168.100.47',
                    raidList: [
                        {
                            arrayLevel: {name: 'RAID 5'}, rule: '3|-1|-1',
                            arrayStripeSize: '8 KB',
                            selectedDisks: [
                                {diskName: "/dev/sdc", isUsed: false, totalSpace: 11489037516, checked: false},
                                {diskName: "/dev/sdd", isUsed: false, totalSpace: 11489037516, checked: false},
                                {diskName: "/dev/sdb", isUsed: false, totalSpace: 11489037516, checked: false}
                            ]
                        }
                    ]
                }
            ]
            */
        },
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
        },
        // services detail info and status
        service: {
            metadataServiceList: [],
            storageServiceList: []
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
            customRAIDList: [
                /*
                {
                    arrayLevel: {name: 'RAID 5', rule: '3|-1|-1'},
                    arrayStripeSize: "8 KB",
                    selectedDisks: [
                        {diskName: '/dev/sdc', isUsed: false, totalSpace: 11489037516, checked: false},
                        {diskName: '/dev/sdd', isUsed: false, totalSpace: 11489037516, checked: false},
                        {diskName: '/dev/sdb', isUsed: false, totalSpace: 11489037516, checked: false}
                    ]
                }
                */
            ],
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
        // storage pool
        storagePool: {
            storagePoolList: [],
            // targets or buddy groups in one storage pool
            targetsOfStoragePool: [
				 // {"capacity": 21474836480, "id": 201, "targetPath": "/data/Orcafs-storage201"},
                 // {"capacity": 21474836480, "id": 302, "targetPath": "/data/Orcafs-storage302"}
            ],
            buddyGroupsOfStoragePool: [
				 // {"capacity": 21474836480, "id": 1, "targetPath": "/data/Orcafs-storage101,/data/Orcafs-storage301"}
            ],
            // for selecting in creation or update operations
            targetsForStoragePool: [
				 // {"capacity": 21474836480, "id": 201, "targetPath": "/data/Orcafs-storage201"},
				 // {"capacity": 21474836480, "id": 302, "targetPath": "/data/Orcafs-storage302"}
			],
            buddyGroupsForStoragePool: [
				 // {"capacity": 21474836480, "id": 1, "targetPath": "/data/Orcafs-storage101,/data/Orcafs-storage301"}
            ],
            userQuotasOfStoragePool: [],
            groupQuotasOfStoragePool: [],
            // data classification setting list
            dataClassificationList: []
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
        // data checking and recovery
        dataChecking: {
            dataCheckingStatus: {current: 0, total: 0, status: 0},
            dataRecoveryStatus: {current: 0, total: 0, status: 0},
            dataCheckingAndRecoveryHistory: [],
        },
        // System parameter configuration
        SystemConfiguration: {
            systemParameterList: [
                {name:"是否开启配额", currentValue:"false", description:"quotaEnableEnforcement", },
                // {name:"日志类型", currentValue:"helperd", description:"logType"}
            ],
        },
    }
}