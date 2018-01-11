const service = require('../service');
const model = {
	async get(ctx) {
		let param = ctx.param;
		let result = await service.test.get(param);
		ctx.body = result;
	},
	async post(ctx) {
		let param = ctx.param;
		let result = await service.test.post(param);
		ctx.body = result;
	},
	async put(ctx) {
		let param = ctx.param;
		let {id, text} = param;
		let result = await service.test.put({id}, {text});
		ctx.body = result;
	},
	async delete(ctx) {
		let param = ctx.param;
		let result = await service.test.delete(param);
		ctx.body = result;
	}
}

module.exports = model;