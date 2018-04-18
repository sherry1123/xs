const config = require('../config');
const handler = require('../module/handler');
const promise = require('../module/promise');
const init = require('../service/initialize');
const snapshot = require('../service/snapshot');
const model = {
	initRequest() {
		return async (ctx, next) => {
			ctx.param = ctx.method.toLowerCase() === 'get' ? ctx.query : ctx.request.body;
			ctx.state = {
				api: ctx.url.split('/').pop().replace(/\?\S+/, ''),
				key: ctx.get('Api-Key'),
				cookie: {
					init: handler.cookie(ctx.cookies.get('init')),
					rollbacking: handler.cookie(ctx.cookies.get('rollbacking')),
					login: handler.cookie(ctx.cookies.get('login'))
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
			key && key === config.keys[api] ? await next() : ctx.body = handler.responseWithoutLog(3);
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
			(api === syncAPI) || (!initStatus === initApiList.includes(api)) ? await next() : ctx.body = !initStatus ? handler.responseWithoutLog(4) : handler.responseWithoutLog(5);
			//(api === syncAPI) || (!initStatus === initApiList.includes(api) && !rollbackStatus) ? await next() : ctx.body = !initStatus ? handler.responseWithoutLog(4) : !rollbackStatus ? handler.responseWithoutLog(5) : handler.responseWithoutLog(61);
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