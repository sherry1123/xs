const Koa = require('koa');
const app = new Koa();
const router = require('./router');
const socket = require('./module/socket');
const middleware = require('./middleware');
const bodyParser = require('koa-bodyparser');

socket.io.attach(app);
app.use(bodyParser());
app.use(middleware.initRequest());
//app.use(middleware.checkKey());
app.use(middleware.syncStatus());
app.use(middleware.filterRequest());
app.use(middleware.compressResponse());
app.use(router.routes()).use(router.allowedMethods());
app.listen(3456);