const service = require('../service');
const handler = require('../module/handler');
const model = {
	index(ctx) {
		ctx.body = 'Home Page';
	},
	async get(ctx) {
		let result = await service.test.get();
		ctx.body = handler.response(result);
	},
	async post(ctx) {
		let param = ctx.param;
		let result = await service.test.post(param);
		ctx.body = handler.response(result);
	}
}

module.exports = model;