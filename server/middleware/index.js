const config = require('../config');
const promise = require('../module/promise');
const init = require('../service/initialize');
const snapshot = require('../service/snapshot');
const cookieHandler = value => (value ? value === 'true' : undefined);
const responseHandler = code => ({ code, msg: config.errors[code] });
const model = {
	initRequest() {
		return async (ctx, next) => {
			ctx.param = ctx.method.toLowerCase() === 'get' ? ctx.query : ctx.request.body;
			ctx.state = {
				api: ctx.url.split('/').pop().replace(/\?\S+/, ''),
				key: ctx.get('Api-Key'),
				cookie: {
					init: cookieHandler(ctx.cookies.get('init')),
					rollbacking: cookieHandler(ctx.cookies.get('rollbacking')),
					login: cookieHandler(ctx.cookies.get('login'))
				},
				encoding: ctx.get('Accept-Encoding'),
				status: {
					init: init.getInitStatus(),
					rollbacking: snapshot.getRollbackStatus()
				}
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
			let { cookie: { init: initCookie, rollbacking: rollbackCookie, login: loginCookie }, status: { init: initStatus, rollbacking: rollbackStatus } } = ctx.state;
			(initCookie !== initStatus) && ctx.cookies.set('init', String(initStatus), config.cookies);
			(rollbackCookie !== rollbackStatus) && ctx.cookies.set('rollbacking', String(rollbackStatus), config.cookies);
			!initStatus && loginCookie && ctx.cookies.set('login', 'false', config.cookies);
		}
	},
	filterRequest() {
		return async (ctx, next) => {
			let { api, status: { init: initStatus, rollbacking: rollbackStatus } } = ctx.state, initApiList = ['checkclusterenv', 'init'], syncAPI = 'syncsystemstatus';
			(api === syncAPI) || (!initStatus === initApiList.includes(api)) ? await next() : ctx.body = !initStatus ? responseHandler(4) : responseHandler(5);
			//(api === syncAPI) || (!initStatus === initApiList.includes(api) && !rollbackStatus) ? await next() : ctx.body = !initStatus ? responseHandler(4) : !rollbackStatus ? responseHandler(5) : responseHandler(61);
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