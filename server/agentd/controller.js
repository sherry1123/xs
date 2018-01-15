const service = require('./service');
const model = {
    '/api/getcpu': ctx => {
        ctx.body = service.getCpu();
    },
    '/api/getmemory': ctx => {
        ctx.body = service.getMemory();
    },
    '/api/getiops': ctx => {
        ctx.body = service.getIops();
    }
};
module.exports = model;