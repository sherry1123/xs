const config = require('../config');
const promise = require('../module/promise');
const init = require('../service/initialize');
const cookieHandler = value => (value ? value === 'true' : undefined);
const responseHandler = code => ({ code, message: config.errors[code] });
const model = {
	initRequest() {
		return async (ctx, next) => {
			ctx.param = ctx.method.toLowerCase() === 'get' ? ctx.query : ctx.request.body;
			ctx.state = {
				api: ctx.url.split('/').pop().replace(/\?\S+/, ''),
				key: ctx.get('Api-Key'),
				cookie: {
					init: cookieHandler(ctx.cookies.get('init'))
				},
				encoding: ctx.get('Accept-Encoding'),
				status: init.getInitStatus()
			};
			await next();
		}
	},
	checkKey() {
		return async (ctx, next) => {
			let { api, key } = ctx.state;
			key && key === config.keys[api] ? await next() : ctx.body = responseHandler(3);
		}
	},
	syncStatus() {
		return async (ctx, next) => {
			await next();
			let { cookie: { init: initCookie }, status: initStatus } = ctx.state;
			(initCookie !== initStatus) && ctx.cookies.set('init', String(initStatus), config.cookies);
		}
	},
	filterRequest() {
		return async (ctx, next) => {
			let { api, status } = ctx.state, initApiList = ['checkclusterenv', 'init'];
			!status === initApiList.includes(api) ? await next() : ctx.body = !status ? responseHandler(4) : responseHandler(5);
		}
	},
	compressResponse() {
		return async (ctx, next) => {
			await next();
			let body = ctx.body, acceptEncoding = ctx.state.encoding;
			if (body && acceptEncoding && acceptEncoding.includes('gzip')) {
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