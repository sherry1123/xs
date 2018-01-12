const service = require('../service');
const model = {
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
        ctx.body = result;
    },
    '/api/logout': ctx => {
        let result = service.logout();
        ctx.body = result;
    }
}
module.exports = model;