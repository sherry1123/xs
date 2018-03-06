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
        return { code, message: result };
    } else {
        return { code, data: result };
    }
};
const errorHandler = (code, message, param = {}) => {
    logger.error(`${config.errors[code]}, message: ${message}, param: ${JSON.stringify(param)}`);
};
const model = {
    async getInitStatus() {
        let result = false;
        try {
            result = await init.getMongoDBStatus() && await init.getOrcaFSStatus();
        } catch (error) {
            errorHandler(1, error);
        }
        init.setInitStatus(result);
        return result;
    },
    async isMaster() {
        let result = false;
        let initStatus = init.getInitStatus();
        if (!initStatus) {
            result = true;
        } else {
            try {
                result = await init.getMongoDBMasterOrNot();
                //todo
            } catch (error) {
                errorHandler(2, error);
            }
        }
        return result;
    },
    /**
     * Check The Cluster Initialization Environment
     * 
     * @param {array} MDS Metadata Servers
     * @param {array} OSS Object Storage Servers
     * @param {array} MS Management Servers
     * @param {boolean} HA High Availability
     * @param {array} CSMIP Cluster Service Management IP
     * @param {array} HBIP Heart Beat IP
     */
    async checkClusterEnv(param) {
        let { ipList } = param;
        let result = {};
        try {
            let data = await init.checkClusterEnv(ipList);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(6, error, param);
        }
        return result;
    },
    /**
     * Initialize The Cluster
     * 
     * According to the parameters to determine whether the cluster is turned on high availability and the type of the database cluster.
     * First initialize the database, and then the file system, finally save the initialization information.
     * 
     * @param {array} MDS Metadata Servers
     * @param {array} OSS Object Storage Servers
     * @param {array} MS Management Servers
     * @param {boolean} HA High Availability
     * @param {array} CSMIP Cluster Service Management IP
     * @param {array} HBIP Heart Beat IP
     */
    async initCluster(param) {
        let { ipList } = param;
        try {
            await init.initMongoDB(ipList);
            await init.initOrcaFS(param);
            await init.saveInitInfo(ipList);
        } catch (error) {
            errorHandler(7, error, param);
            await model.antiInitCluster(param);
        }
    },
    async antiInitCluster(param) {
        let { ipList } = param;
        try {
            await init.antiInitMongoDB(ipList);
            await init.antiInitOrcaFS(param);
        } catch (error) {
            errorHandler(8, error, param);
        }
    },
    async login(param) {
        let result = {};
        try {
            let data = await database.getUser(param);
            if (data.length) {
                await model.addAuditLog({ user: param.username, desc: 'login success' });
                result = responseHandler(0, 'login success');
            } else {
                result = responseHandler(9, 'username or password error', param);
            }
        } catch (error) {
            result = responseHandler(9, error, param);
        }
        return result;
    },
    async logout(param) {
        let result = responseHandler(0, 'logout success');
        await model.addAuditLog({ user: param.username, desc: 'logout success' });
        return result;
    },
    async getUser(param) {
        let result = {};
        try {
            let data = await database.getUser(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(10, error, param);
        }
        return result;
    },
    async addUser(param) {
        let result = {};
        try {
            await database.addUser(param)
            result = responseHandler(0, 'create user success');
        } catch (error) {
            result = responseHandler(11, error, param);
        }
        return result;
    },
    async updateUser(param) {
        let result = {};
        try {
            let { username, password } = param;
            let query = { username, password };
            await database.updateUser(query, param);
            result = responseHandler(0, 'update user success');
        } catch (error) {
            result = responseHandler(12, error, param);
        }
        return result;
    },
    async deleteUser(param) {
        let result = {};
        try {
            await database.deleteUser(param);
            result = responseHandler(0, 'delete user success');
        } catch (error) {
            result = responseHandler(13, error, param);
        }
        return result;
    },
    async getEventLog(param) {
        let result = {};
        try {
            let data = await database.getEventLog(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(14, error, param);
        }
        return result;
    },
    async addEventLog(param) {
        let { time = new Date(), node = 'cluster', desc, level = 1, source = 'nodejs', read = false } = param;
        try {
            await database.addEventLog({ time, node, desc, level, source, read });
        } catch (error) {
            errorHandler(15, error, param);
        }
    },
    async updateEventLog(param) {
        let result = {};
        try {
            let { ids, id, read } = param;
            let querys = ids ? ids.map(id => ({ _id: id })) : [{ _id: id }];
            for (let query of querys) {
                await database.updateEventLog(query, param);
            }
            result = responseHandler(0, 'update event log success');
        } catch (error) {
            result = responseHandler(16, error, param);
        }
        return result;
    },
    async getAuditLog(param) {
        let result = {};
        try {
            let data = await database.getAuditLog(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(17, error, param);
        }
        return result;
    },
    async addAuditLog(param) {
        let { time = new Date(), user, group = 'admin', desc, level = 1, ip = '127.0.0.1' } = param;
        try {
            await database.addAuditLog({ time, user, group, desc, level, ip });
        } catch (error) {
            errorHandler(18, error, param);
        }
    },
    async getHardware(param) {
        let result = {};
        try {
            let data = await database.getHardware(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(19, error, param);
        }
        return result;
    },
    async addHardware() {
        let date = new Date();
        let api = config.api.agentd.hardware;
        let url = api;
        try {
            let iplist = await database.getSetting({ key: 'nodelist' });
            iplist = iplist.value.split(',');
            let data = [];
            for (let ip of iplist) {
                url = api.replace('localhost', ip);
                let res = await request.get(url);
                data.push(res);
            }
            await database.addHardware({ date, iplist, data });
        } catch (error) {
            errorHandler(20, error, url);
        }
    },
    async testMail(param) {
        let result = {};
        try {
            await email.sendMail(param);
            result = responseHandler(0, 'test mail success');
        } catch (error) {
            result = responseHandler(21, error, param);
        }
        return result;
    },
    async sendMail(param) {
        try {
            await email.sendMail(param);
        } catch (error) {
            errorHandler(22, error, param);
        }
    }
};
module.exports = model;