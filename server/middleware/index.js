const config = require('../config');
const promise = require('../module/promise');
const init = require('../service/initialize');
const model = {
	initRequest() {
		return async (ctx, next) => {
			let method = ctx.method.toLowerCase();
			let api = ctx.url.split('/').pop().replace(/\?\S+/, '');
			let key = ctx.get('Api-Key');
			let status = init.getInitStatus();
			let encoding = ctx.get('Accept-Encoding');
			ctx.param = method === 'get' ? ctx.query : ctx.request.body;
			ctx.state = { api, key, status, encoding };
			await next();
		}
	},
	checkKey() {
		return async (ctx, next) => {
			let { api, key } = ctx.state;
			if (key && key === config.keys[api]) {
				await next();
			} else {
				ctx.body = { code: 20, message: config.errors[20] };
			}
		}
	},
	filterRequest() {
		return async (ctx, next) => {
			let { api, status } = ctx.state;
			let initApi = ['init', 'clusterenvcheck'];
			if (!status) {
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
			await next();
			let initStatus = String(ctx.state.status);
			let initCookie = ctx.cookies.get('init');
			if (!initCookie || initCookie !== initStatus) {
				ctx.cookies.set('init', initStatus, config.cookies);
			}
		}
	},
	compressResponse() {
		return async (ctx, next) => {
			await next();
			let body = ctx.body;
			let acceptEncoding = ctx.state.encoding;
			if (acceptEncoding && acceptEncoding.includes('gzip')) {
				try {
					body = await promise.gzipDataInPromise(body);
					ctx.set('Content-Encoding', 'gzip');
					ctx.body = body;
				} catch (error) {
					ctx.body = body;
				}
			}
		}
	}
};
module.exports = model;