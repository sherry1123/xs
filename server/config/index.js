exports.process = {
    name: ['master', 'agentd', 'job', 'task']
};
exports.env = {
    root: process.env.PWD,
    name: process.env.NAME,
    init: process.env.INIT_STATUS,
    master: process.env.IS_MASTER
};
exports.database = {
    name: 'storage',
    bin: '/usr/bin',
    dbpath: '/var/lib/mongo',
    logpath: '/var/log/mongodb/mongod.log',
    replicaSet: 'orcafs'
};
exports.log = {
    path: '/var/log/orcafs-gui.log',
    maxSize: 1024 * 1024 * 10,
    backup: 3
};
exports.cookie = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    overwrite: false,
    httpOnly: false,
    signed: false,
    rolling: true
};
exports.snapshot = {
    total: 64,
    manual: 25,
    auto: 39
};
exports.setting = {
    nodeList: 'nodelist',
    initParam: 'initparam',
    snapshotSetting: 'snapshotsetting'
};
exports.api = {
    agentd: {
        hardware: 'http://localhost:3457/hardware/getall'
    },
    server: {
        receiveevent: 'http://localhost/api/receiveevent'
    },
    orcafs: {
        gettoken: 'http://localhost:9090/token/get',
        listdisk: 'http://localhost:9090/disk/list/',
        createstatus: 'http://localhost:9090/cluster/createstatus',
        createcluster: 'http://localhost:9090/cluster/create',
        destroycluster: 'http://localhost:9090/cluster/destroy',
        listmetanodes: 'http://localhost:9090/cluster/listmetanodes',
        liststoragenodes: 'http://localhost:9090/cluster/liststoragenodes',
        getstoragespace: 'http://localhost:9090/cluster/getstoragespace',
        liststoragetargets: 'http://localhost:9090/cluster/liststoragetargets',
        getiostat: 'http://localhost:9090/cluster/getiostat',
        getstats: 'http://localhost:9090/cluster/getstats',
        entryinfo: 'http://localhost:9090/cluster/getentryinfo',
        getfiles: 'http://localhost:9090/cluster/getfiles',
        setpattern: 'http://localhost:9090/cluster/setpattern'
    }
};
exports.key = {
    testapi: 'c40b0c360f3d4959b53b103b25759542',
    getuser: '88a8ee2321ca3ef6bf45dfe625402fe7',
    adduser: 'a8d729744cce939323d37f1789be0d4f',
    updateuser: '4f6505ab0b8ecee1f4bddcf0bfd003d3',
    deleteuser: 'ca701625c04e4b73f8f761fa69b8dde7',
    login: 'd56b699830e77ba53855679cb1d252da',
    logout: '4236a440a662cc8253d7536e5aa17942',
    geteventlog: 'e134e1b7a00b6f4f388fc3557c5886bd',
    updateeventlog: 'b32d2152410c89625ad5d611110c4182',
    getauditlog: '8d64c515f80f1f5840933ab4a71140d4',
    gethardware: '4a717d8d0a9f11097869871fafc60dc5',
    testmail: '4cdf930bd89937490d7bf7f1ce96b3dd',
    init: 'e37f0136aa3ffaf149b351f6a4c948e9',
    antiinit: '186716b8d7c8ce050a0710ccf43c89c8'
};
exports.error = {
    0: ['the cluster is anti-initializing', 'the cluster is rollbacking'],
    1: 'the cluster is not initialized',
    2: 'the cluster has been initialized',
    11: 'no key or wrong key',
    12: 'gzip response body error',
    21: 'get the cluster initialization status error',
    22: 'get the node is the master node or not error',
    23: 'connect to mongodb error',
    31: 'check the cluster initialization environment error',
    32: 'get raid recommended configuration error',
    33: 'get disk list error',
    41: 'initialize the cluster error',
    42: 'de-initialize the cluster error',
    51: 'login error',
    52: 'get user error',
    53: 'add user error',
    54: 'update user error',
    55: 'delete user error',
    61: 'test email error',
    62: 'send email error',
    71: 'get hardware error',
    72: 'run hardware task error',
    81: 'get metadata status error',
    91: 'get storage status error',
    92: 'get storage disk space error',
    93: 'get storage target error',
    94: 'get storage throughput error',
    101: 'get client metadata stats error',
    102: 'get client storage stats error',
    111: 'get user metadata stats error',
    112: 'get user storage stats error',
    121: 'get snapshot setting error',
    122: 'update snapshot setting error',
    131: 'get snapshot error',
    132: 'create snapshot error',
    133: 'update snapshot error',
    134: 'delete snapshot error',
    135: 'delete snapshots error',
    136: 'rollback snapshot error',
    141: 'get snapshot task error',
    142: 'create snapshot task error',
    143: 'update snapshot task error',
    144: 'enable snapshot task error',
    145: 'disable snapshot task error',
    146: 'delete snapshot task error',
    147: 'delete snapshot tasks error',
    148: 'run snapshot task error',
    151: 'get nas export error',
    152: 'create nas export error',
    153: 'update nas export error',
    154: 'delete nas export error',
    161: 'get event log error',
    162: 'add event log error',
    163: 'update event log error',
    164: 'get audit log error',
    165: 'add audit log error',
    171: 'get entry info error',
    172: 'get files error',
    173: 'set pattern error'
};
exports.event = {
    1: 'de-initialize cluster start',
    2: 'de-initialize cluster end',
    11: 'delete snapshot successfully',
    12: 'delete snapshot failed',
    13: 'delete snapshots successfully',
    14: 'delete snapshots failed',
    15: 'rollback snapshots start',
    16: 'rollback snapshots end',
    21: 'change admin password',
};