const IO = require('koa-socket');
const io = new IO();
const logger = require('./logger');
io.on('connection', socket => {
    logger.info('socket connect success');
});
exports.io = io;
exports.postInitStatus = status => {
    io.broadcast('init status', status);
};