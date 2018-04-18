const logger = require('./logger');
const config = require('../config');
const model = {
    currentTime() {
        return new Date(new Date().toISOString().replace(/:\d+\.\d+/, ':00.000'));
    },
    startTime() {
        return new Date(new Date(new Date().getTime() + 60000).toISOString().replace(/:\d+\.\d+/, ':00.000'));
    },
    cookie(value) {
        return value ? value === 'true' : undefined;
    },
    responseWithoutLog(code) {
        return { code, msg: config.errors[code] };
    },
    error(code, message, param = {}) {
        logger.error(`${config.errors[code]}, message: ${message}, param: ${JSON.stringify(param)}`);
    },
    response(code, result, param) {
        if (code) {
            model.error(code, result, param);
            return { code, msg: result ? typeof result === 'object' ? result.message || '' : result : '' };
        } else {
            return { code, data: result };
        }
    },
    user(context) {
        return context.cookies.get('user');
    },
    clientIP(context) {
        return context.get('x-real-ip');
    }
};
module.exports = model;