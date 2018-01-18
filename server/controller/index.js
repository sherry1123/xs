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
		let {username, password} = param;
		let result = await service.updateUser({username}, {password});
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
        let {ids, read} = param;
        ids.map(id => ({_id: id}));
        let result = await service.updateEventLog(ids, {read});
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
    }
}
module.exports = model;