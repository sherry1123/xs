const IO = require('koa-socket');
const io = new IO();
exports.io = io;
exports.postInitStatus = (current, status, total) => {
    io.broadcast('init status', { current, status, total });
};
exports.postEventStatus = (channel, code, target, result, notify) => {
    io.broadcast('event status', { channel, code, target, result, notify });
};