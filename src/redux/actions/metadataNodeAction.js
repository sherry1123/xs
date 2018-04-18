export const metadataNodeActionTypes = {
    SET_METADATA_NODES: 'SET_METADATA_NODES',
    SET_METADATA_NODE_OVERVIEW_STATICS: 'SET_METADATA_NODE_OVERVIEW_STATICS',
    SET_METADATA_NODE_DETAIL_SUMMARY: 'SET_METADATA_NODE_DETAIL_SUMMARY',
    SET_METADATA_NODE_DETAIL_STATICS: 'SET_METADATA_NODE_DETAIL_STATICS',
};

export default {
    setMetadataNodes: data => ({
        type: metadataNodeActionTypes.SET_METADATA_NODES,
        data
    }),

    setMetadataNodeOverviewUserOperationStatics: statics => ({
        type: metadataNodeActionTypes.SET_METADATA_NODE_OVERVIEW_STATICS,
        statics
    }),

    setMetadataNodeDetailSummary: data => ({
        type: metadataNodeActionTypes.SET_METADATA_NODE_DETAIL_SUMMARY,
        data
    }),

    setMetadataNodeDetailUserOperationStatics: statics => ({
        type: metadataNodeActionTypes.SET_METADATA_NODE_DETAIL_STATICS,
        statics
    }),
};