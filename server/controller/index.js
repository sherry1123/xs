const config = require('../config');
const service = require('../service');
const model = {
    '/api/testapi': ctx => {
        ctx.body = ctx;
    },
    '/api/getuser': async ctx => {
        let param = ctx.param;
        let result = await service.getUser(param);
        ctx.body = result;
    },
    '/api/adduser': async ctx => {
        let param = ctx.param;
        let result = await service.addUser(param);
        ctx.body = result;
    },
    '/api/updateuser': async ctx => {
        let param = ctx.param;
        let result = await service.updateUser(param);
        ctx.body = result;
    },
    '/api/deleteuser': async ctx => {
        let param = ctx.param;
        let result = await service.deleteUser(param);
        ctx.body = result;
    },
    '/api/login': async ctx => {
        let param = ctx.param;
        let result = await service.login(param);
        if (!result.code) {
            ctx.cookies.set('login', 'true', config.cookies);
        }
        ctx.body = result;
    },
    '/api/logout': async ctx => {
        let param = ctx.param;
        let result = await service.logout(param);
        ctx.cookies.set('login', 'false', config.cookies);
        ctx.body = result;
    },
    '/api/geteventlog': async ctx => {
        let param = ctx.param;
        let result = await service.getEventLog(param);
        ctx.body = result;
    },
    '/api/updateeventlog': async ctx => {
        let param = ctx.param;
        let result = await service.updateEventLog(param);
        ctx.body = result;
    },
    '/api/getauditlog': async ctx => {
        let param = ctx.param;
        let result = await service.getAuditLog(param);
        ctx.body = result;
    },
    '/api/gethardware': async ctx => {
        let param = ctx.param;
        let result = await service.getHardware(param);
        ctx.body = result;
    },
    '/api/testmail': async ctx => {
        let param = ctx.param;
        let result = await service.testMail(param);
        ctx.body = result;
    },
    '/api/init': ctx => {
        let param = ctx.param;
        service.initCluster(param);
        ctx.body = { code: 0, data: 'start to initialize cluster' };
    },
    '/api/antiinit': ctx => {
        let param = ctx.param;
        service.antiInitCluster(param);
        ctx.body = { code: 0, data: 'start to anti-initialize cluster' };
    }
}
module.exports = model;