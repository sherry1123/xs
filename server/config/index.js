exports.process = {
    name: ['master', 'agentd', 'job', 'task']
};
exports.env = {
    root: process.env.PWD,
    name: process.env.name,
    init: process.env.initStatus
};
exports.database = {
    name: 'storage'
};
exports.nginx = {
    path: '/etc/nginx/nginx.conf',
    proxy: "proxy_pass $master;\n            proxy_set_header Host $host;\n            proxy_set_header Connection '';\n            proxy_set_header X-Real-IP  $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
};
exports.logs = {
    path: '/logs/server.log',
    maxSize: 1024 * 1024 * 10,
    backup: 3
};
exports.errors = {
    1: 'error 1',
    2: 'error 2'
};
exports.cookies = {
    maxAge: 1000 * 60 * 15,
    overwrite: false,
    httpOnly: false,
    signed: false,
    rolling: true
};
exports.settings = {
    initParam: 'initparam',
    uiSetting: 'uisetting',
    emailSetting: 'emailsetting'
};