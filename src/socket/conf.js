export const socketEventChannel = {
    snapshot: () => ({
        chinese: '快照操作',
        english: 'Snapshot Operation '
    }),
};

export const eventCodeForEventChannel = {
    snapshot: [1, 2, 3, 4, 5, 6],
};

export const socketEventCode = {
    // code 1-20 for snapshot channel
    1: () => ({
        chinese: target => `快照 ${target} 删除成功！`,
        english: target => `Snapshot ${target} deleted successfully！`
    }),
    2: () => ({
        chinese: target => `快照 ${target} 删除失败！`,
        english: target => `Snapshot ${target} deleted failed！`
    }),
    3: () => ({
        chinese: target => `快照 ${target} 回滚成功！`,
        english: target => `Snapshot ${target} rollback successfully！`
    }),
    4: () => ({
        chinese: target => `快照 ${target} 回滚失败！`,
        english: target => `Snapshot ${target} rollback failed！`
    }),
    5: () => ({
        chinese: target => `批量删除${target.total}个快照成功！`,
        english: target => `Batch delete ${target.total} snapshots complete!`
    }),
    6: () => ({
        chinese: target => `批量删除${target.total}个快照完成，删除成功${target.success}个，删除失败${target.failed}个！`,
        english: target => `Batch delete ${target.total} snapshots complete, ${target.success} successfully deleted, ${target.failed} failed!`
    }),
};