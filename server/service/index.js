const config = require('../config');
const database = require('./database');
const logger = require('../module/logger');
const promise = require('../module/promise');
const responseHandler = (code, result, param) => {
    if (code) {
        errorHandler(code, result, param);
        return {code, message: result};
    } else {
        return {code, data: result};
    }
};
const errorHandler = (code, message, param) => {
    logger.error(`${config.errorType[code]}, param: ${JSON.stringify(param)}, reason: ${message}`);
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
    isMaster() {
        return true;
    },
    async updateNginxConfig(ip) {
        let path = '/etc/nginx/nginx.conf';
        try {
            let file = await promise.readFileInPromise(path);
            let data = file.replace(/127\.0\.0\.1/g, `${ip}`)
                .replace(/try_files\s\$uri\s\/index\.html;/, 
                "proxy_pass $master;\n            proxy_set_header Host $host;\n            proxy_set_header Connection '';\n            proxy_set_header X-Real-IP  $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;");
            await promise.writeFileInPromise(path, data);
        } catch (error) {
            errorHandler(1, error, ip);
        }
    },
    async login(param) {
        let result = {};
        try {
            let data = await database.getUser(param);
            result = data.length ? responseHandler(0, 'login success') : responseHandler(1, 'username or password error', param);
        } catch (error) {
            result = responseHandler(1, error, param);
        }
        return result;
    },
    logout() {
        let result = responseHandler(0, 'logout success');
        return result;
    }
}
module.exports = model;