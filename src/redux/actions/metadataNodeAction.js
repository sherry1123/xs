export const metadataNodeActionTypes = {
    SET_METADATA_NODE_OVERVIEW_SUMMARY: 'SET_METADATA_NODE_OVERVIEW_SUMMARY',
    SET_METADATA_NODE_DETAIL_SUMMARY: 'SET_METADATA_NODE_DETAIL_SUMMARY',
    SET_METADATA_NODE_OVERVIEW_USER_OPERATION_STATICS: 'SET_METADATA_NODE_OVERVIEW_USER_OPERATION_STATICS',
};

export default {
    setMetadataNodeOverviewSummary: data => ({
        type: metadataNodeActionTypes.SET_METADATA_NODE_OVERVIEW_SUMMARY,
        data
    }),

    setMetadataNodeOverviewUserOperationStatics: userOperationStatics => ({
        type: metadataNodeActionTypes.SET_METADATA_NODE_OVERVIEW_USER_OPERATION_STATICS,
        userOperationStatics
    }),

    setMetadataNodeDetailSummary: data => ({
        type: metadataNodeActionTypes.SET_METADATA_NODE_DETAIL_SUMMARY,
        data
    }),
};