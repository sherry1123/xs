const config = require('../config');
const init = require('../service/initialize');
const model = {
	initParam() {
		return async (ctx, next) => {
			let method = ctx.method.toLowerCase();
			ctx.param = method === 'get' ? ctx.query : ctx.request.body;
			await next();
		}
	},
	syncInitStatus() {
		return async (ctx, next) => {
			let initStatus = init.getInitStatus();
			let initCookie = ctx.cookies.get('init');
			if (!initCookie || initCookie !== initStatus) {
				ctx.cookies.set('init', initStatus, config.cookies);
			}
			await next();
		}
	}
}

module.exports = model;