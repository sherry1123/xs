exports.env = {
    root: process.env.PWD,
    name: process.env.name,
    init: process.env.initStatus,
    log: '/log/log4js.log'
};
exports.database = {
    name: 'storage'
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