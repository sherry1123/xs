const config = require('../config');
const promise = require('../module/promise');
const init = require('../service/initialize');
const responseHandler = code => ({ code, message: config.errors[code] });
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
				ctx.body = responseHandler(3);
			}
		}
	},
	filterRequest() {
		return async (ctx, next) => {
			let { api, status } = ctx.state;
			let initApi = ['checkclusterenv', 'init'];
			if (!status) {
				if (initApi.includes(api)) {
					await next();
				} else {
					ctx.body = responseHandler(4);
				}
			} else {
				if (!initApi.includes(api)) {
					await next();
				} else {
					ctx.body = responseHandler(5);
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
			if (!body) return;
			let acceptEncoding = ctx.state.encoding;
			if (acceptEncoding && acceptEncoding.includes('gzip')) {
				try {
					ctx.body = await promise.gzipDataInPromise(body);
					ctx.set('Content-Encoding', 'gzip');
				} catch (error) {
					ctx.body = body;
				}
			}
		}
	}
};
module.exports = model;