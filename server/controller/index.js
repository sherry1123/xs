const config = require('../config');
const service = require('../service');
const model = {
    '/api/testapi': ctx => {
        ctx.body = ctx;
    },
    '/api/getuser': async ctx => {
        ctx.body = await service.getUser(ctx.param);
    },
    '/api/adduser': async ctx => {
        ctx.body = await service.addUser(ctx.param);
    },
    '/api/updateuser': async ctx => {
        ctx.body = await service.updateUser(ctx.param);
    },
    '/api/deleteuser': async ctx => {
        ctx.body = await service.deleteUser(ctx.param);
    },
    '/api/login': async ctx => {
        ctx.body = await service.login(ctx.param);
        if (!ctx.body.code) {
            ctx.cookies.set('login', 'true', config.cookies);
        }
    },
    '/api/logout': async ctx => {
        ctx.body = await service.logout(ctx.param);
        ctx.cookies.set('login', 'false', config.cookies);
    },
    '/api/geteventlog': async ctx => {
        ctx.body = await service.getEventLog(ctx.param);
    },
    '/api/updateeventlog': async ctx => {
        ctx.body = await service.updateEventLog(ctx.param);
    },
    '/api/getauditlog': async ctx => {
        ctx.body = await service.getAuditLog(ctx.param);
    },
    '/api/gethardware': async ctx => {
        ctx.body = await service.getHardware(ctx.param);
    },
    '/api/testmail': async ctx => {
        ctx.body = await service.testMail(ctx.param);
    },
    '/api/init': ctx => {
        ctx.body = { code: 0, data: 'start to initialize cluster' };
        service.initCluster(ctx.param);
    },
    '/api/antiinit': ctx => {
        ctx.body = { code: 0, data: 'start to anti-initialize cluster' };
        service.antiInitCluster(ctx.param);
    },
    '/api/checkclusterenv': async ctx => {
        ctx.body = await service.checkClusterEnv(ctx.param);
    }
};
module.exports = model;