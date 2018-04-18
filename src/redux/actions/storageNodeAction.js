export const storageNodeActionTypes = {
    SET_STORAGE_NODE_OVERVIEW_SUMMARY: 'SET_STORAGE_NODE_OVERVIEW_SUMMARY',
    SET_STORAGE_NODE_DISK_STATUS: 'SET_STORAGE_NODE_DISK_STATUS',
    SET_STORAGE_NODE_OVERVIEW_THROUGHPUT: 'SET_STORAGE_NODE_OVERVIEW_THROUGHPUT',
    SET_STORAGE_NODE_DETAIL_TARGETS: 'SET_STORAGE_NODE_DETAIL_TARGETS',
    SET_STORAGE_NODE_DETAIL_THROUGHPUT: 'SET_STORAGE_NODE_DETAIL_THROUGHPUT',
};

export default {
    setStorageNodeOverviewSummary: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_OVERVIEW_SUMMARY,
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