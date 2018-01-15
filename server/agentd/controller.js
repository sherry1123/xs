const service = require('./service');
const model = {
    '/api/getcpuusage': ctx => {
        ctx.body = service.getCpuUsage();
    },
    '/api/getmemoryusage': ctx => {
        ctx.body = service.getMemoryUsage();
    }
};
module.exports = model;