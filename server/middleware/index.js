const config = require('../config');
const init = require('../service/initialize');
const model = {
	initRequest() {
		return async (ctx, next) => {
			let method = ctx.method.toLowerCase();
			let api = ctx.url.split('/').pop().replace(/\?\S+/, '');
			let initStatus = init.getInitStatus();
			ctx.param = method === 'get' ? ctx.query : ctx.request.body;
			ctx.state.api = api;
			ctx.state.init = initStatus;
			await next();
		}
	},
	checkKey() {
		return async (ctx, next) => {
			let key = ctx.get('api-key');
			let api = ctx.state.api;
			if (key && key === config.keys[api]) {
				await next();
			} else {
				ctx.body = { code: 20, message: config.errors[20] };
			}
		}
	},
	filterRequest() {
		return async (ctx, next) => {
			let api = ctx.state.api;
			let initStatus = ctx.state.init;
			let initApi = ['init'];
			if (!initStatus) {
				if (initApi.includes(api)) {
					await next();
				} else {
					ctx.body = { code: 21, message: config.errors[21] };
				}
			} else {
				if (!initApi.includes(api)) {
					await next();
				} else {
					ctx.body = { code: 22, message: config.errors[22] };
				}
			}
		}
	},
	syncStatus() {
		return async (ctx, next) => {
			let initStatus = String(ctx.state.init);
			let initCookie = ctx.cookies.get('init');
			if (!initCookie || initCookie !== initStatus) {
				ctx.cookies.set('init', initStatus, config.cookies);
			}
			await next();
		}
	}
}

module.exports = model;