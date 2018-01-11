const service = require('../service');
const model = {
    '/api/getuser': async ctx => {
        let param = ctx.param;
		let result = await service.getUser(param);
		ctx.body = result;
    },
    '/api/createuser': async ctx => {
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
    }
}
module.exports = model;