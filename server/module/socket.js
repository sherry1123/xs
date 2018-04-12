const IO = require('koa-socket');
const io = new IO();
const logger = require('./logger');

exports.io = io;
exports.postInitStatus = status => {
    io.broadcast('init status', status);
};
exports.postEventStatus = status => {
    io.broadcast('event status', status);
};