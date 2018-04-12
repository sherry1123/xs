export const CAPACITY_UNIT_SIZE_MAP = {
    'TB': 1024 * 1024 * 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'MB': 1024 * 1024
};

export const Time_UNIT_MILLISECOND_MAP = {
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

export const USER_STATICS_ITEMS = [
    'userOrClientName', 'sum', 'ack', 'close', 'entInf',
    'nodeInf', 'fndOwn', 'Ink', 'mkdir', 'create',
    'rddir', 'refrEnt', 'mdsInf', 'rmdir', 'rmLnk',
    'mvDirIns', 'mvFiIns', 'open', 'ren', 'setChDrct',
    'sAttr', 'sDirPat', 'stat', 'statfs', 'trunc',
    'symInk', 'unInk', 'lookLI', 'statLI', 'revalLI',
    'openLI', 'createLI', 'mirrorMD', 'hardInk', 'flckAp',
    'flckEn', 'flckRg', 'dirparent', 'listXA', 'getXA',
    'rmXA', 'setXA'
];