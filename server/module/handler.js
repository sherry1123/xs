const logger = require('./logger');
const config = require('../config');
const model = {
    currentTime() {
        return new Date(new Date().toISOString().replace(/:\d+\.\d+/, ':00.000'));
    },
    startTime() {
        return new Date(new Date(new Date().getTime() + 60000).toISOString().replace(/:\d+\.\d+/, ':00.000'));
    },
    emptyObject(object) {
        return Object.keys(object).length === 0;
    },
    toByte(value, unit) {
        let unitList = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        return Math.floor(value * Math.pow(1024, unitList.indexOf(unit)));
    },
    cookie(value) {
        return value ? value === 'true' : undefined;
    },
    user(context) {
        return context.cookies.get('user');
    },
    clientIP(context) {
        return context.get('x-real-ip');
    },
    error(code, message, param = {}) {
        logger.error(config.error[code] + ', message: ' + message + model.emptyObject(param) ? '' : ', param: ' + JSON.stringify(param));
    },
    response(code, result, param) {
        if (code) {
            model.error(code, result, param);
            return { code, msg: result ? typeof result === 'object' ? result.message || '' : result : '' };
        } else {
            return { code, data: result };
        }
    },
    responseWithoutLog(code) {
        return { code, msg: config.error[code] };
    },
};
module.exports = model;