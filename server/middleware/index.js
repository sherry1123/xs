const config = require('../config');
const status = require('../service/status');
const handler = require('../module/handler');
const promise = require('../module/promise');
const model = {
	initRequest() {
		return async (ctx, next) => {
			ctx.param = ctx.method.toLowerCase() === 'get' ? ctx.query : ctx.request.body;
			ctx.state = {
				api: ctx.url.split('/').pop().replace(/\?\S+/, ''),
				key: ctx.get('Api-Key'),
				cookie: {
					init: handler.cookie(ctx.cookies.get('init')),
					deinit: handler.cookie(ctx.cookies.get('deinit')),
					rollbacking: handler.cookie(ctx.cookies.get('rollbacking')),
					login: handler.cookie(ctx.cookies.get('login'))
				},
				encoding: ctx.get('Accept-Encoding'),
				status: {
					init: status.getInitStatus(),
					deinit: status.getDeinitStatus(),
					rollbacking: status.getRollbackStatus()
				}
			};
			await next();
		}
	},
	checkKey() {
		return async (ctx, next) => {
			let { api, key } = ctx.state;
			key && key === config.key[api] ? await next() : ctx.body = handler.responseWithoutLog(11);
		}
	},
	syncStatus() {
		return async (ctx, next) => {
			await next();
			let { cookie: { init: initCookie, deinit: deinitCookie, rollbacking: rollbackCookie, login: loginCookie }, status: { init: initStatus, deinit: deinitStatus, rollbacking: rollbackStatus } } = ctx.state;
			(initCookie !== initStatus) && ctx.cookies.set('init', String(initStatus), config.cookie);
			(deinitCookie !== deinitStatus) && ctx.cookies.set('deinit', String(deinitStatus), config.cookie);
			(rollbackCookie !== rollbackStatus) && ctx.cookies.set('rollbacking', String(rollbackStatus), config.cookie);
			!initStatus && loginCookie && ctx.cookies.set('login', 'false', config.cookie) && ctx.cookies.set('user', '', config.cookie);
		}
	},
	filterRequest() {
		return async (ctx, next) => {
			let { api, status: { init: initStatus, deinit: deinitStatus, rollbacking: rollbackStatus } } = ctx.state;
			let syncAPI = 'syncsystemstatus';
			let raidAPI = 'getraidrecommendedconfiguration';
			let initApiList = ['checkclusterenv', 'getdisklist', 'init'];
			(api === syncAPI || api === raidAPI) || (!initStatus === initApiList.includes(api) && !rollbackStatus && !deinitStatus) ? await next() : ctx.body = !initStatus ? handler.responseWithoutLog(1) : !deinitStatus ? !rollbackStatus ? handler.responseWithoutLog(2) : handler.responseWithoutLog(0, 1) : handler.responseWithoutLog(0, 0);
		}
	},
	compressResponse() {
		return async (ctx, next) => {
			await next();
			let body = ctx.body;
			let acceptEncoding = ctx.state.encoding;
			if (body && acceptEncoding && acceptEncoding.includes('gzip')) {
				try {
					ctx.body = await promise.gzipDataInPromise(body);
					ctx.set('Content-Encoding', 'gzip');
				} catch (error) {
					handler.error(12, error);
					ctx.body = body;
				}
			}
		}
	}
};
module.exports = model;