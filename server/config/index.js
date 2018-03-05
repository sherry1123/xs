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
    bin: '/usr/local/mongodb/bin',
    dbpath: '/usr/local/mongodb/data/db',
    logpath: '/usr/local/mongodb/log/mongodb.log',
    replicaSet: 'orcafs'
};
exports.nginx = {
    path: '/etc/nginx/nginx.conf',
    proxy: "proxy_pass $master;\n            proxy_set_header Host $host;\n            proxy_set_header Connection '';\n            proxy_set_header X-Real-IP  $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
};
exports.api = {
    agentd: {
        hardware: 'http://localhost:3457/hardware/getall'
    },
    orcafs: {
        gettoken: 'http://localhost:9090/token/get',
        createcluster: 'http://localhost:9090/cluster/create',
        installstatus: 'http://localhost:9090/cluster/createinstallstatus'
    }
}
exports.logs = {
    path: '/logs/server.log',
    maxSize: 1024 * 1024 * 10,
    backup: 3
};
exports.cookies = {
    maxAge: 1000 * 60 * 15,
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
    1: 'get user error',
    2: 'add user error',
    3: 'update user error',
    4: 'delete user error',
    5: 'check node is master or not error',
    6: 'update nginx config error',
    7: 'login error',
    8: 'get event log error',
    9: 'add event log error',
    10: 'update event log error',
    11: 'get audit log error',
    12: 'add audit log error',
    13: 'get hardware error',
    14: 'add hardware error',
    15: 'send email error',
    16: 'test email error',
    17: 'get cluster init status error',
    18: 'init cluster error',
    19: 'anti-init cluster error',
    20: 'no key or key error',
    21: 'cluster not initialize',
    22: 'cluster initialized',
    23: 'get cluster is master or not error',
    24: 'cluster environment error'
};