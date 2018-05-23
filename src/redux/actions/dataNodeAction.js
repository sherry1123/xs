export const dataNodeActionTypes = {
    SET_CURRENT_PHYSICAL_NODE: 'SET_CURRENT_PHYSICAL_NODE',
    SET_PHYSICAL_NODE_INFO: 'SET_PHYSICAL_NODE_INFO',
    SET_PHYSICAL_NODE_TARGETS: 'SET_PHYSICAL_NODE_TARGETS',
    SET_PHYSICAL_NODE_CPU: 'SET_PHYSICAL_NODE_CPU',
    SET_PHYSICAL_NODE_RAM: 'SET_PHYSICAL_NODE_RAM',
    SET_PHYSICAL_NODE_TPS: 'SET_PHYSICAL_NODE_TPS',
    SET_PHYSICAL_NODE_IOPS: 'SET_PHYSICAL_NODE_IOPS',
};

export default {
    setCurrentPhysicalNode: currentPhysicalNode => ({
        type: dataNodeActionTypes.SET_CURRENT_PHYSICAL_NODE,
        currentPhysicalNode
    }),

    setPhysicalNodeInfo: physicalNodeInfo => ({
        type: dataNodeActionTypes.SET_PHYSICAL_NODE_INFO,
        physicalNodeInfo
    }),

    setPhysicalNodeTargets: physicalNodeTargets => ({
        type: dataNodeActionTypes.SET_PHYSICAL_NODE_TARGETS,
        physicalNodeTargets
    }),

    setPhysicalNodeCPU: physicalNodeCPU => ({
        type: dataNodeActionTypes.SET_PHYSICAL_NODE_CPU,
        physicalNodeCPU
    }),

    setPhysicalNodeRAM: physicalNodeRAM => ({
        type: dataNodeActionTypes.SET_PHYSICAL_NODE_RAM,
        physicalNodeRAM
    }),

    setPhysicalNodeTPS: physicalNodeTPS => ({
        type: dataNodeActionTypes.SET_PHYSICAL_NODE_TPS,
        physicalNodeTPS
    }),

    setPhysicalNodeIOPS: physicalNodeIOPS => ({
        type: dataNodeActionTypes.SET_PHYSICAL_NODE_IOPS,
        physicalNodeIOPS
    }),
};