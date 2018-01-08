const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

app.use(bodyParser());
app.use(async (ctx, next) => {
	let method = ctx.method.toLowerCase();
	ctx.param = method === 'get' ? ctx.query : ctx.request.body;
	await next();
})
router.get('/', ctx => ctx.body = 'Agent Home Page');
app.use(router.routes()).use(router.allowedMethods());
app.listen(3457);