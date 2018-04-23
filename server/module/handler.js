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
    cookie(value) {
        return value ? value === 'true' : undefined;
    },
    responseWithoutLog(code) {
        return { code, msg: config.error[code] };
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
    user(context) {
        return context.cookies.get('user');
    },
    clientIP(context) {
        return context.get('x-real-ip');
    },
    toByte(value, unit) {
        let unitList = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        let byte = 0;
        for (let i in unitList) {
            if (unit === unitList[i]) {
                byte = Math.floor(value * Math.pow(1024, i));
                break;
            }
        }
        return byte;
    },
};
module.exports = model;