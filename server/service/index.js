const email = require('./email');
const config = require('../config');
const database = require('./database');
const logger = require('../module/logger');
const promise = require('../module/promise');
const request = require('../module/request');
const responseHandler = (code, result, param) => {
    if (code) {
        errorHandler(code, result, param);
        return {code, message: result};
    } else {
        return {code, data: result};
    }
};
const errorHandler = (code, message, param = {}) => {
    logger.error(`${config.errors[code]}, message: ${message}, param: ${JSON.stringify(param)}`);
};
const model = {
    async getUser(param) {
        let result = {};
        try {
            let data = await database.getUser(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    async addUser(param) {
        let result = {};
        try {
            await database.addUser(param)
            result = responseHandler(0, 'create user success');
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    async updateUser(query, param) {
        let result = {};
        try {
            await database.updateUser(query, param);
            result = responseHandler(0, 'update user success');
        } catch (error) {
            result = responseHandler(1, error, {query, param});
        }
        return result;
    },
    async deleteUser(param) {
        let result = {};
        try {
            await database.deleteUser(param);
            result = responseHandler(0, 'delete user success');
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    async isMaster() {
        let result = true;
        // let path = config.nginx.path;
        // try {
        //     let file = await promise.readFileInPromise(path);
        //     result = file.includes('127.0.0.1:3000') ? true : false;
        // } catch (error) {
        //     errorHandler(1, error);
        // }
        return result;
    },
    async updateNginxConfig(param) {
        let path = config.nginx.path;
        try {
            let file = await promise.readFileInPromise(path);
            let data = file.replace(/127\.0\.0\.1/g, `${param}`).replace(/try_files\s\$uri\s\/index\.html;/, config.nginx.proxy);
            await promise.writeFileInPromise(path, data);
        } catch (error) {
            errorHandler(1, error, param);
        }
    },
    async login(param) {
        let result = {};
        try {
            let data = await database.getUser(param);
            if (data.length) {
                await model.addAuditLog({user: param.username, desc: 'login success'});
                result = responseHandler(0, 'login success');
            } else {
                result = responseHandler(1, 'username or password error', param);
            }
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    async logout(param) {
        let result = responseHandler(0, 'logout success');
        await model.addAuditLog({user: param.username, desc: 'logout success'});
        return result;
    },
    async getEventLog(param) {
        let result = {};
        try {
            let data = await database.getEventLog(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    async addEventLog(param) {
        let {time = new Date(), node = 'cluster', desc, level = 1, source = 'nodejs', read = false} = param;
        try {
            await database.addEventLog({time, node, desc, level, source, read});
        } catch (error) {
            errorHandler(1, error, param);
        }
    },
    async updateEventLog(querys, param) {
        let result = {};
        try {
            for (let query of querys) {
                await database.updateEventLog(query, param);
            }
            result = responseHandler(0, 'update event log success');
        } catch (error) {
            result = responseHandler(1, error, {querys, param});
        }
        return result;
    },
    async getAuditLog(param) {
        let result = {};
        try {
            let data = await database.getAuditLog(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    async addAuditLog(param) {
        let {time = new Date(), user, group = 'admin', desc, level = 1, ip = '127.0.0.1'} = param;
        try {
            await database.addAuditLog({time, user, group, desc, level, ip});
        } catch (error) {
            errorHandler(1, error, param);
        }
    },
    async getHardware(param) {
        let result = {};
        try {
            let data = await database.getHardware(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    async addHardware() {
        let url = 'http://localhost:3457/hardware/getall';
        try {
            let res = await request.get(url);
            let {iplist, data} = res;
            await database.addHardware({date: new Date, iplist, data});
        } catch (error) {
            errorHandler(1, error, url);
        }
    },
    async sendMail(param) {
        try {
            await email.sendMail(param);
        } catch (error) {
            errorHandler(1, error, param);
        }
    },
    async testMail(param) {
        let result = {};
        try {
            await email.sendMail(param);
            result = responseHandler(0, 'test mail success');
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    }
}
module.exports = model;