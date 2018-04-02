exports.process = {
    name: ['master', 'agentd', 'job', 'task']
};
exports.env = {
    root: process.env.PWD,
    name: process.env.NAME,
    init: process.env.INIT_STATUS
};
exports.database = {
    name: 'storage',
    bin: '/usr/bin',
    dbpath: '/var/lib/mongo',
    logpath: '/var/log/mongodb/mongod.log',
    replicaSet: 'orcafs'
};
exports.nginx = {
    path: '/etc/nginx/nginx.conf',
    proxy: "proxy_pass $master;\n            proxy_set_header Host $host;\n            proxy_set_header Connection '';\n            proxy_set_header X-Real-IP  $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
};
exports.api = {
    agentd: {
        hardware: 'http://localhost:3457/hardware/getall',
        metanodes: 'http://localhost:3457/hardware/getmetanodes',
        knownproblems: 'http://localhost:3457/hardware/getknownproblems'
    },
    orcafs: {
        gettoken: 'http://192.168.100.101:9090/token/get',
        createcluster: 'http://192.168.100.101:9090/cluster/create',
        createstatus: 'http://192.168.100.101:9090/cluster/createstatus',
        listdisk: 'http://192.168.100.101:9090/disk/list/',
        destroycluster: 'http://192.168.100.101:9090/cluster/destroy'
    },
    admon: {
        nodelist: 'http://192.168.100.101:8000/XML_NodeList',
        metanodesoverview: 'http://192.168.100.101:8000/XML_MetanodesOverview',
        metanode: 'http://192.168.100.101:8000/XML_Metanode',
        storagenodesoverview: 'http://192.168.100.101:8000/XML_StoragenodesOverview',
        storagenode: 'http://192.168.100.101:8000/XML_Storagenode',
        clientstats: 'http://192.168.100.101:8000/XML_ClientStats',
        userstats: 'http://192.168.100.101:8000/XML_UserStats',
        knownproblems: 'http://192.168.100.101:8000/XML_KnownProblems'
    }
}
exports.logs = {
    path: '/logs/server.log',
    maxSize: 1024 * 1024 * 10,
    backup: 3
};
exports.cookies = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    overwrite: false,
    httpOnly: false,
    signed: false,
    rolling: true
};
exports.settings = {
    initSetting: 'initsetting',
    uiSetting: 'uisetting',
    emailSetting: 'emailsetting'
};
exports.keys = {
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
exports.errors = {
    1: 'get the cluster initialization status error',
    2: 'get the node is the master node or not error',
    3: 'no key or wrong key',
    4: 'the cluster is not initialized',
    5: 'the cluster has been initialized',
    6: 'check the cluster initialization environment error',
    7: 'initialize the cluster error',
    8: 'anti-initialize the cluster error',
    9: 'login error',
    10: 'get user error',
    11: 'add user error',
    12: 'update user error',
    13: 'delete user error',
    14: 'get event log error',
    15: 'add event log error',
    16: 'update event log error',
    17: 'get audit log error',
    18: 'add audit log error',
    19: 'get hardware error',
    20: 'add hardware error',
    21: 'test mail error',
    22: 'send mail error'
};