export const storageNodeActionTypes = {
    SET_STORAGE_NODE_OVERVIEW_SUMMARY: 'SET_STORAGE_NODE_OVERVIEW_SUMMARY',
    SET_STORAGE_NODE_OVERVIEW_THROUGHPUT: 'SET_STORAGE_NODE_OVERVIEW_THROUGHPUT',
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
};