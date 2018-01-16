const IO = require('koa-socket');
const io = new IO();
io.on('connection', socket => {
    console.log('socket connect success');
});
exports.io = io;