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
	checkKey() {
		return async (ctx, next) => {
			let key = ctx.header['api-key'];
			let api = ctx.url.split('/').pop().replace(/\?\S+/, '');
			if (key && key === config.keys[api]) {
				await next();
			} else {
				ctx.body = {code: 20, message: config.errors[20]};
			}
		}
	},
	syncStatus() {
		return async (ctx, next) => {
			let initStatus = String(init.getInitStatus());
			let initCookie = ctx.cookies.get('init');
			if (!initCookie || initCookie !== initStatus) {
				ctx.cookies.set('init', initStatus, config.cookies);
			}
			await next();
		}
	}
}

module.exports = model;