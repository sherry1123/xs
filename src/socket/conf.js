export const socketEventChannel = {
    snapshot: () => ({
        chinese: '快照操作',
        english: 'Snapshot Operation'
    }),

    cluster: () => ({
        chinese: '集群操作',
        english: 'Cluster Operation'
    }),

    user: () => ({
        chinese: '用户警告',
        english: 'User Warning'
    }),
};

export const eventCodeForEventChannel = {
    deInitializationStart: [1],
    deInitializationEnd: [2],

    snapshot: [11, 12, 13, 14, 15, 16],
    snapshotRollBackStart: [15],
    snapshotRollBackFinish: [16],

    user: [21],
};

export const socketEventCode = {
    // code 1-10 for system de-initialization channel
    1: ()=> ({
        chinese: () => `系统开始反初始化！`,
        english: () => `System starts de-initializing！`
    }),
    2: ()=> ({
        chinese: (target, result) => `系统反初始化${result ? '成功' : '失败'}！`,
        english: (target, result) => `System de-initialization ${result ? 'successfully' : 'failed'}!`
    }),

    // code 1-20 for snapshot channel
    11: () => ({
        chinese: target => `快照 ${target} 删除成功！`,
        english: target => `Snapshot ${target} deleted successfully！`
    }),
    12: () => ({
        chinese: target => `快照 ${target} 删除失败！`,
        english: target => `Snapshot ${target} deleted failed！`
    }),
    13: () => ({
        chinese: target => `批量删除${target.total}个快照成功！`,
        english: target => `Batch delete ${target.total} snapshots complete!`
    }),
    14: () => ({
        chinese: target => `批量删除${target.total}个快照完成，删除成功${target.success}个，删除失败${target.failed}个！`,
        english: target => `Batch delete ${target.total} snapshots complete, ${target.success} successfully deleted, ${target.failed} failed!`
    }),
    15: () => ({
        chinese: target => `快照 ${target} 回滚开始！`,
        english: target => `Start rolling back snapshot ${target}！`
    }),
    16: () => ({
        chinese: (target, result) => `快照 ${target} 回滚${result ? '成功' : '失败'}！`,
        english: (target, result) => `Roll back snapshot ${target} ${result ? 'successfully' : 'failed'}！`
    }),

    // code 21-30 for user channel
    21: () => ({
        chinese: (target) => `为了系统安全，管理员用户 ${target.username} 的默认初始密码需要修改！`,
        english: (target) => `The default password of administrators user ${target.username} needs to be changed to ensure the security of system.`
    }),

};