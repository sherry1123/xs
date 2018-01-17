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
    path: '/etc/nginx/nginx.conf'
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