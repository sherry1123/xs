exports.process = {
    name: ['master', 'agentd', 'job', 'task']
};
exports.env = {
    root: process.env.PWD,
    name: process.env.name,
    init: process.env.initStatus
};
exports.database = {
    name: 'storage',
    conf: '/usr/local/mongodb/mongodb.conf',
    back: '/usr/local/mongodb/mongodb.conf.bak',
    path: '/usr/local/mongodb/data/db'
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
        init: 'http://localhost:3000/orcafs/init'
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
    19: 'anti-init cluster error'
};