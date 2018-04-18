export const storageNodeActionTypes = {
    SET_STORAGE_NODES: 'SET_STORAGE_NODES',
    SET_STORAGE_NODE_DISK_STATUS: 'SET_STORAGE_NODE_DISK_STATUS',
    SET_STORAGE_NODE_OVERVIEW_THROUGHPUT: 'SET_STORAGE_NODE_OVERVIEW_THROUGHPUT',
    SET_STORAGE_NODE_DETAIL_TARGETS: 'SET_STORAGE_NODE_DETAIL_TARGETS',
    SET_STORAGE_NODE_DETAIL_THROUGHPUT: 'SET_STORAGE_NODE_DETAIL_THROUGHPUT',
};

export default {
    setStorageNodes: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODES,
        data
    }),

    setStorageNodeDiskStatus: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_DISK_STATUS,
        data
    }),

    setStorageNodeOverviewThroughput: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_OVERVIEW_THROUGHPUT,
        data
    }),

    setStorageNodeDetailTargets: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_TARGETS,
        data
    }),

    setStorageNodeDetailThroughput: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_THROUGHPUT,
        data
    }),
};