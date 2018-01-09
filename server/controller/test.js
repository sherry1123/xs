const testService = require('../service/test');
const model = {
	index(ctx) {
		ctx.body = 'Home Page';
	},
	async get(ctx) {
		let result = await testService.get();
		ctx.body = result;
	},
	async post(ctx) {
		let param = ctx.param;
		let result = await testService.post(param);
		ctx.body = result;
	}
}

module.exports = model;