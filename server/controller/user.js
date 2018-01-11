const service = require('../service');
const model = {
	async get(ctx) {
		let param = ctx.param;
		let result = await service.user.get(param);
		ctx.body = result;
	},
	async post(ctx) {
		let param = ctx.param;
		let result = await service.user.post(param);
		ctx.body = result;
	},
	async put(ctx) {
		let param = ctx.param;
		let {username, password} = param;
		let result = await service.user.put({username}, {password});
		ctx.body = result;
	},
	async delete(ctx) {
		let param = ctx.param;
		let result = await service.user.delete(param);
		ctx.body = result;
	}
}

module.exports = model;