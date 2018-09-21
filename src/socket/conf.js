export const socketEventChannel = {
    snapshot: () => ({
        chinese: '快照信息',
        english: 'Snapshot Operation'
    }),

    cluster: () => ({
        chinese: '集群信息',
        english: 'Cluster Operation'
    }),

    user: () => ({
        chinese: '用户警告',
        english: 'User Warning'
    }),
};

export const eventCodeForEventChannel = {
    // socket event codes group by different business channels

    // system channel
    deInitializationStart: [1],
    deInitializationEnd: [2],
    reInitializationStart: [3],
    reInitializationEnd: [4],

    // snapshot channel
    snapshot: [11, 12, 13, 14, 15, 16],
    snapshotRollBackStart: [17],
    snapshotRollBackFinish: [18],

    // user channel
    user: [21],
};

export const socketEventCode = {
    // code 1-10 for system channel
    1: ()=> ({
        chinese: () => `集群开始反初始化！`,
        english: () => `Cluster is de-initializing！`
    }),
    2: ()=> ({
        chinese: (target, result) => `集群反初始化${result ? '成功' : '失败'}！`,
        english: (target, result) => `Cluster de-initialization ${result ? 'successfully' : 'failed'}!`
    }),
    3: ()=> ({
        chinese: () => `集群正在创建管理服务并开启高可用功能！`,
        english: () => `Cluster is creating management service and enable the high availability feature！`
    }),
    4: ()=> ({
        chinese: (target, result) => `集群创建管理服务并开启高可用功能${result ? '成功' : '失败'}！`,
        english: (target, result) => `Cluster create management service and enable the high availability feature ${result ? 'successfully' : 'failed'}!`
    }),

    // code 11-20 for snapshot channel
    11: () => ({
        chinese: target => `快照 ${target} 开始创建！`,
        english: target => `Snapshot ${target} started creating！`
    }),
    12: () => ({
        chinese: (target, result) => `快照 ${target} 创建${result ? '成功' : '失败'}！`,
        english: (target, result) => `Snapshot ${target} created ${result ? 'successfully' : 'failed'}！`
    }),
    13: () => ({
        chinese: target => `快照 ${target} 删除成功！`,
        english: target => `Snapshot ${target} deleted successfully！`
    }),
    14: () => ({
        chinese: target => `快照 ${target} 删除失败！`,
        english: target => `Snapshot ${target} deleted failed！`
    }),
    15: () => ({
        chinese: target => `批量删除${target.total}个快照成功！`,
        english: target => `Batch delete ${target.total} snapshots complete!`
    }),
    16: () => ({
        chinese: (target, result) => `批量删除${target.total}个快照${result ? '成功' : '失败'}！`,
        english: (target, result) => `Batch delete ${target.total} snapshots ${result ? 'successfully' : 'failed'}！`
    }),
    17: () => ({
        chinese: target => `快照 ${target} 回滚开始！`,
        english: target => `Start rolling back snapshot ${target}！`
    }),
    18: () => ({
        chinese: (target, result) => `快照 ${target} 回滚${result ? '成功' : '失败'}！`,
        english: (target, result) => `Roll back snapshot ${target} ${result ? 'successfully' : 'failed'}！`
    }),

    // code 21-30 for user channel
    21: () => ({
        chinese: (target) => `为了系统安全，管理员用户 ${target.username} 的默认初始密码需要修改！`,
        english: (target) => `The default password of administrators user ${target.username} needs to be changed to ensure the security of system.`
    }),

};