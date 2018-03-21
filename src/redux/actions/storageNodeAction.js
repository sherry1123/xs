export const storageNodeActionTypes = {
    SET_STORAGE_NODE_OVERVIEW_SUMMARY: 'SET_STORAGE_NODE_OVERVIEW_SUMMARY',
    SET_STORAGE_NODE_OVERVIEW_THROUGHPUT: 'SET_STORAGE_NODE_OVERVIEW_THROUGHPUT',
    SET_STORAGE_NODE_DETAIL_SUMMARY: 'SET_STORAGE_NODE_DETAIL_SUMMARY',
    SET_STORAGE_NODE_DETAIL_THROUGHPUT: 'SET_STORAGE_NODE_DETAIL_THROUGHPUT',
};

export default {
    setStorageNodeOverviewSummary: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_OVERVIEW_SUMMARY,
        data
    }),

    setStorageNodeOverviewThroughput: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_OVERVIEW_THROUGHPUT,
        data
    }),

    setStorageNodeDetailSummary: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_SUMMARY,
        data
    }),

    setStorageNodeDetailThroughput: data => ({
        type: storageNodeActionTypes.SET_STORAGE_NODE_DETAIL_THROUGHPUT,
        data
    }),
};