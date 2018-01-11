const init = require('../service/initialize');
const model = {
	initParam() {
		return async (ctx, next) => {
			let method = ctx.method.toLowerCase();
			ctx.param = method === 'get' ? ctx.query : ctx.request.body;
			await next();
		}
	},
	getInitStatus() {
		return async (ctx, next) => {
			let initStatus = init.getInitStatus();
			//todo
			await next();
		}
	}
}

module.exports = model;