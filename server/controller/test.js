const service = require('../service');
const model = {
	index(ctx) {
		ctx.body = 'Home Page';
	},
	async get(ctx) {
		let result = await service.test.get();
		ctx.body = result;
	},
	async post(ctx) {
		let param = ctx.param;
		let result = await service.test.post(param);
		ctx.body = result;
	}
}

module.exports = model;