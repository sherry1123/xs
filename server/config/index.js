exports.database = {
    name: 'storage'
};
exports.errors = {
    1: 'test error 1',
    2: 'test error 2'
};
exports.cookies = {
    maxAge: 1000 * 60 * 15,
    overwrite: false,
    httpOnly: false,
    signed: false,
    rolling: true
};