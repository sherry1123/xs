const Koa = require('koa');
const app = new Koa();
const socket = require('./module/socket');
const router = require('./router');
const middleware = require('./middleware');
const bodyParser = require('koa-bodyparser');

socket.io.attach(app);
app.use(bodyParser());
app.use(middleware.initParam());
app.use(middleware.syncInitStatus());
app.use(router.routes()).use(router.allowedMethods());
app.listen(3456);