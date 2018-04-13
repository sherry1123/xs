export const CAPACITY_UNIT_SIZE_MAP = {
    'TB': 1024 * 1024 * 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'MB': 1024 * 1024
};

export const TIME_UNIT_MILLISECOND_MAP = {
    'Week': 3600 * 24 * 7,
    'Day': 3600 * 24,
    'Hour': 3600,
    'Minute': 60
};

export const INTERVAL_LIST = [
    {name: '小时', value: 3600},
    {name: '天', value: 3600 * 24},
    {name: '周', value: 3600 * 24 * 7}
];

export const METADATA_STATICS_ITEMS = [
    'userOrClientName', 'sum', 'ack', 'close', 'entInf',
    'nodeInf', 'fndOwn', 'Ink', 'mkdir', 'create',
    'rddir', 'refrEnt', 'mdsInf', 'rmdir', 'rmLnk',
    'mvDirIns', 'mvFiIns', 'open', 'ren', 'setChDrct',
    'sAttr', 'sDirPat', 'stat', 'statfs', 'trunc',
    'symlnk', 'unlnk', 'lookLI', 'statLI', 'revalLI',
    'openLI', 'createLI', 'mirrorMD', 'hardlnk', 'flckAp',
    'flckEn', 'flckRg', 'dirparent', 'listXA', 'getXA',
    'rmXA', 'setXA'
];

export const STORAGE_STATICS_ITEMS = [
    'userOrClientName', 'sum', 'ack', 'sChDrct', 'getFSize',
    'sAttr', 'statfs', 'trunc', 'close', 'fsync',
    'open', 'ops-rd', 'B-rd', 'ops-wr', 'B-wr',
    'gendbg', 'hrtbeat', 'remNode', 'nodeInf', 'storInf',
    'unInk'
];

export const socketEventStatus = {
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
};