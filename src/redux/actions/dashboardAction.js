export const dashboardActionTypes = {
    SET_CLUSTER_INFO: 'SET_CLUSTER_INFO',
    SET_CLUSTER_TARGETS: 'SET_CLUSTER_TARGETS',
    SET_CLUSTER_TPS: 'SET_CLUSTER_TPS',
    SET_CLUSTER_IOPS: 'SET_CLUSTER_IOPS',
    SET_CLUSTER_PHYSICAL_NODE_LIST: 'SET_CLUSTER_PHYSICAL_NODE_LIST',
};

export default {
    setClusterInfo: clusterInfo => ({
        type: dashboardActionTypes.SET_CLUSTER_INFO,
        clusterInfo
    }),

    setClusterTargets: clusterTargets => ({
        type: dashboardActionTypes.SET_CLUSTER_TARGETS,
        clusterTargets
    }),

    setClusterThroughput: clusterTPS => ({
        type: dashboardActionTypes.SET_CLUSTER_TPS,
        clusterTPS
    }),

    setClusterIOPS: clusterIOPS => ({
        type: dashboardActionTypes.SET_CLUSTER_IOPS,
        clusterIOPS
    }),

    setClusterPhysicalNodeList: clusterPhysicalNodeList => ({
        type: dashboardActionTypes.SET_CLUSTER_PHYSICAL_NODE_LIST,
        clusterPhysicalNodeList
    }),
};