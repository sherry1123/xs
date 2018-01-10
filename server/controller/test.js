const service = require('../service');
const handler = require('../module/handler');
const model = {
	async get(ctx) {
		let param = ctx.param;
		let result = await service.test.get(param);
		ctx.body = handler.response(result);
	},
	async post(ctx) {
		let param = ctx.param;
		let result = await service.test.post(param);
		ctx.body = handler.response(result);
	},
	async put(ctx) {
		let param = ctx.param;
		let {id, text} = param;
		let result = await service.test.put({id}, {text});
		ctx.body = handler.response(result);
	},
	async delete(ctx) {
		let param = ctx.param;
		let result = await service.test.delete(param);
		ctx.body = handler.response(result);
	}
}

module.exports = model;