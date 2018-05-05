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
					deInit: handler.cookie(ctx.cookies.get('deInit')),
					rollbacking: handler.cookie(ctx.cookies.get('rollbacking')),
					login: handler.cookie(ctx.cookies.get('login'))
				},
				encoding: ctx.get('Accept-Encoding'),
				status: {
					init: init.getInitStatus(),
					deInit: init.getAntiInitStatus(),
					rollbacking: snapshot.getRollbackStatus()
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
			let { cookie: { init: initCookie, deInit: antiInitCookie, rollbacking: rollbackCookie, login: loginCookie }, status: { init: initStatus, deInit: antiInitStatus, rollbacking: rollbackStatus } } = ctx.state;
			(initCookie !== initStatus) && ctx.cookies.set('init', String(initStatus), config.cookie);
			(antiInitCookie !== antiInitStatus) && ctx.cookies.set('deInit', String(antiInitStatus), config.cookie);
			(rollbackCookie !== rollbackStatus) && ctx.cookies.set('rollbacking', String(rollbackStatus), config.cookie);
			!initStatus && loginCookie && ctx.cookies.set('login', 'false', config.cookie) && ctx.cookies.set('user', '', config.cookie);
		}
	},
	filterRequest() {
		return async (ctx, next) => {
			let { api, status: { init: initStatus, deInit: antiInitStatus, rollbacking: rollbackStatus } } = ctx.state;
			let syncAPI = 'syncsystemstatus';
			let initApiList = ['checkclusterenv', 'getraidrecommendedconfiguration', 'getdisklist', 'init'];
			(api === syncAPI) || (!initStatus === initApiList.includes(api) && !rollbackStatus && !antiInitStatus) ? await next() : ctx.body = !initStatus ? handler.responseWithoutLog(1) : !antiInitStatus ? !rollbackStatus ? handler.responseWithoutLog(2) : handler.responseWithoutLog(0, 1) : handler.responseWithoutLog(0, 0);
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