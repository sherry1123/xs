const email = require('./email');
const config = require('../config');
const init = require('./initialize');
const database = require('./database');
const socket = require('../module/socket');
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
            result = responseHandler(2, error, param);
        }
        return result;
    },
    async updateUser(param) {
        let result = {};
        try {
            let query = {username, password} = param;
            delete param.username;
            delete param.password;
            await database.updateUser(query, param);
            result = responseHandler(0, 'update user success');
        } catch (error) {
            result = responseHandler(3, error, param);
        }
        return result;
    },
    async deleteUser(param) {
        let result = {};
        try {
            await database.deleteUser(param);
            result = responseHandler(0, 'delete user success');
        } catch (error) {
            result = responseHandler(4, error, param);
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
        //     errorHandler(5, error);
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
            errorHandler(6, error, param);
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
                result = responseHandler(7, 'username or password error', param);
            }
        } catch (error) {
            result = responseHandler(7, error, param);
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
            result = responseHandler(8, error, param);
        }
        return result;
    },
    async addEventLog(param) {
        let {time = new Date(), node = 'cluster', desc, level = 1, source = 'nodejs', read = false} = param;
        try {
            await database.addEventLog({time, node, desc, level, source, read});
        } catch (error) {
            errorHandler(9, error, param);
        }
    },
    async updateEventLog(param) {
        let result = {};
        try {
            let {ids, read} = param;
            let query = ids.map(id => ({_id: id}));
            delete param.ids;
            for (let query of querys) {
                await database.updateEventLog(query, param);
            }
            result = responseHandler(0, 'update event log success');
        } catch (error) {
            result = responseHandler(10, error, param);
        }
        return result;
    },
    async getAuditLog(param) {
        let result = {};
        try {
            let data = await database.getAuditLog(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(11, error, param);
        }
        return result;
    },
    async addAuditLog(param) {
        let {time = new Date(), user, group = 'admin', desc, level = 1, ip = '127.0.0.1'} = param;
        try {
            await database.addAuditLog({time, user, group, desc, level, ip});
        } catch (error) {
            errorHandler(12, error, param);
        }
    },
    async getHardware(param) {
        let result = {};
        try {
            let data = await database.getHardware(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(13, error, param);
        }
        return result;
    },
    async addHardware() {
        let url = config.api.agentd.hardware;
        try {
            let res = await request.get(url);
            let {iplist, data} = res;
            await database.addHardware({date: new Date, iplist, data});
        } catch (error) {
            errorHandler(14, error, url);
        }
    },
    async sendMail(param) {
        try {
            await email.sendMail(param);
        } catch (error) {
            errorHandler(15, error, param);
        }
    },
    async testMail(param) {
        let result = {};
        try {
            await email.sendMail(param);
            result = responseHandler(0, 'test mail success');
        } catch (error) {
            result = responseHandler(16, error, param);
        }
        return result;
    },
    getInitStatus() {
        let result = false;
        try {
            result = false;
        } catch (error) {
            errorHandler(17, error);
        }
        init.setInitStatus(result);
        return result;
    },
    async initCluster(param) {
        let {iplist} = param;
        try {
            //await init.initMongoDB(iplist);
            // let token = await request.get(config.api.orcafs.gettoken);
            // let result = await request.post(config.api.orcafs.createcluster, param, token);
            // if (result.errorid === 103) {
            //     errorHandler(18, result.message, param);
            // } else {
            //     let data = {};
            //     let getInitStatus = setInterval(() => {
            //         data = await request.get(config.api.orcafs.installstatus, null, token);
            //         if (data.errorid === 103) {
            //             errorHandler(18, data.message, param);
            //             clearInterval(getInitStatus);
            //             await model.antiInitCluster();
            //         } else {
            //             socket.postInitStatus(data);
            //         }
            //     }, 1000);
            // }
        } catch (error) {
            errorHandler(18, error, param);
        }
    },
    async antiInitCluster() {
        try {
            //await init.antiInitMongoDB();
        } catch (error) {
            errorHandler(19, error);
        }
    }
}
module.exports = model;