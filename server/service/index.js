const email = require('./email');
const config = require('../config');
const init = require('./initialize');
const database = require('./database');
const socket = require('../module/socket');
const logger = require('../module/logger');
const fileSystem = require('./filesystem');
const promise = require('../module/promise');
const request = require('../module/request');
const responseHandler = (code, result, param) => {
    if (code) {
        errorHandler(code, result, param);
        return { code, message: typeof (result) === 'object' ? result.message || '' : result };
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
            result = await init.getOrcaFSStatus();
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
     * @param {array} meta Metadata Servers
     * @param {array} storage Object Storage Servers
     * @param {array} client Client Servers
     * @param {array} mgmt Management Servers
     * @param {boolean} HA High Availability
     * @param {array} floatIP Cluster Service Management IP
     * @param {array} heartbeatIP Heart Beat IP
     * @param {boolean} RAID Redundant Array of Independent Disks
     */
    async initCluster(param) {
        try {
            let { mongodbParam, orcafsParam, nodelist } = init.handleInitParam(param);
            let res = await init.initOrcaFS(orcafsParam);
            if (!res.errorId) {
                let getInitProgress = setInterval(async () => {
                    let progress = await init.getOrcaFSInitProgress();
                    if (!progress.errorId) {
                        let { currentStep, describle, errorMessage, status, totalStep } = progress.data;
                        if (currentStep !== totalStep) {
                            socket.postInitStatus({ current: currentStep, status, total: totalStep + 3 });
                        }
                        if (currentStep && currentStep === totalStep && describle.includes('finish')) {
                            clearInterval(getInitProgress);
                            socket.postInitStatus({ current: 5, status: 0, total: totalStep + 3 });
                            await init.initMongoDB(mongodbParam);
                            socket.postInitStatus({ current: 6, status: 0, total: totalStep + 3 });
                            await init.saveInitInfo({ nodelist, initparam: param });
                            socket.postInitStatus({ current: 7, status: 0, total: totalStep + 3 });
                            init.setInitStatus(true);
                            logger.info('init successfully');
                        }
                    }
                }, 1000);
            } else {
                errorHandler(7, res.message, param);
            }
        } catch (error) {
            errorHandler(7, error, param);
            await model.antiInitCluster(2);
        }
    },
    /**
     * Antiinitialize The Cluster
     * 
     * 
     * @param {number} mode 1 => all; 2 => only database
     */
    async antiInitCluster(mode) {
        try {
            if (mode === 1) {
                await init.antiInitOrcaFS();
            }
            let getAntiinitProgress = setInterval(async () => {
                let progress = await init.getOrcaFSInitProgress();
                if (!progress.errorId) {
                    let { currentStep, describle, errorMessage, status, totalStep } = progress.data;
                    logger.info({ currentStep, describle, errorMessage, status, totalStep })
                    if (!currentStep && describle.includes('finish')) {
                        clearInterval(getAntiinitProgress);
                        let mongodbStatus = await init.getMongoDBStatus();
                        if (mongodbStatus) {
                            let nodelist = await database.getSetting({ key: 'nodelist' });
                            nodelist = JSON.parse(nodelist.value);
                            await init.antiInitMongoDB(nodelist);
                        }
                        logger.info('antiinit successfully');
                    }
                }
            }, 1000);
        } catch (error) {
            errorHandler(8, error, mode);
        }
    },
    /**
     * Login
     * 
     * @param {string} username username
     * @param {string} password password
     */
    async login(param) {
        let result = {};
        try {
            let data = await database.getUser(param);
            if (data.username) {
                await model.addAuditLog({ user: param.username, desc: 'login success' });
                result = responseHandler(0, data);
            } else {
                result = responseHandler(9, 'username or password error', param);
            }
        } catch (error) {
            result = responseHandler(9, error, param);
        }
        return result;
    },
    /**
     * Logout
     * 
     * @param {string} username username
     */
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
            iplist = JSON.parse(iplist.value);
            let data = [];
            for (let ip of iplist) {
                url = api.replace('localhost', ip);
                let res = await request.get(url, {}, {}, true);
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
    },
    /**
     * Get Node List
     * 
     * @param {boolean} clients get client nodes or not
     * @param {boolean} admon get admon node or not
     */
    async getNodeList(param) {
        let result = {};
        try {
            let data = await fileSystem.getNodeList(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Nodes Overview
     * 
     * @param {int} timeSpanRequests the length of statistical time, the unit is minute, the interval is one second
     */
    async getMetaNodesOverview(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNodesOverview(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Node Detail
     * 
     * @param {int} timeSpanRequests the length of statistical time, the unit is minute, the interval is one second
     * @param {string} node node's hostname
     * @param {int} nodeNumID node's id
     */
    async getMetaNode(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNode(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Storage Nodes Overview
     * 
     * @param {string} group the group which the node belongs
     */
    async getStorageNodesOverview(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNodesOverview(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Storage Node Detail
     * 
     * @param {string} node node's hostname
     * @param {int} nodeNumID node's id
     */
    async getStorageNode(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNode(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Client Stats
     * 
     * @param {int} nodeType node's type, 1 => meta, 2 => storage
     * @param {int} interval interval, the unit is second
     * @param {int} numLines the number of clients
     * @param {int} requestorID the id of the requestor
     * @param {int} nextDataSequenceID the next data sequence's id
     */
    async getClientStats(param) {
        let result = {};
        try {
            let data = await fileSystem.getClientStats(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get User Stats
     * 
     * @param {int} nodeType node's type, 1 => meta, 2 => storage
     * @param {int} interval interval, the unit is second
     * @param {int} numLines the number of clients
     * @param {int} requestorID the id of the requestor
     * @param {int} nextDataSequenceID the next data sequence's id
     */
    async getUserStats(param) {
        let result = {};
        try {
            let data = await fileSystem.getUserStats(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Storage Nodes Status And Disk Summary
     * 
     * @param {string} group the group which the node belongs
     */
    async getStorageNodesStatusAndDIskSummary(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNodesOverview(param);
            data = { status: data.status, diskSpace: data.diskSpace };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Storage Nodes Throughput
     * 
     * @param {string} group the group which the node belongs
     */
    async getStorageNodesThroughput(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNodesOverview(param);
            data = { diskPerfRead: data.diskPerfRead, diskPerfWrite: data.diskPerfWrite };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Storage Node Status And Disk Summary
     * 
     * @param {int} timeSpanRequests the length of statistical time, the unit is minute, the interval is one second
     * @param {string} node node's hostname
     * @param {int} nodeNumID node's id
     */
    async getStorageNodeStatusAndDIskSummary(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNode(param);
            data = { general: data.general, storageTargets: data.storageTargets };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Storage Node Throughput
     * 
     * @param {int} timeSpanRequests the length of statistical time, the unit is minute, the interval is one second
     * @param {string} node node's hostname
     * @param {int} nodeNumID node's id
     */
    async getStorageNodeThroughput(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNode(param);
            data = { diskPerfRead: data.diskPerfRead, diskPerfWrite: data.diskPerfWrite };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Nodes Status
     * 
     * @param {int} timeSpanRequests the length of statistical time, the unit is minute, the interval is one second
     */
    async getMetaNodesStatus(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNodesOverview(param);
            data = { general: data.general, status: data.status };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Nodes Request
     * 
     * @param {int} interval interval, the unit is second
     * @param {int} numLines the number of clients
     * @param {int} requestorID the id of the requestor
     * @param {int} nextDataSequenceID the next data sequence's id
     */
    async getMetaNodesRequest(param) {
        let result = {};
        try {
            let data = await request.get(config.api.agentd.metanodes, param, {}, true);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Node Status
     * 
     * @param {int} timeSpanRequests the length of statistical time, the unit is minute, the interval is one second
     * @param {string} node node's hostname
     * @param {int} nodeNumID node's id
     */
    async getMetaNodeStatus(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNode(param);
            data = { general: data.general };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    async getKnownProblems(param) {
        let result = {};
        try {
            let data = await request.get(config.api.agentd.knownproblems, param, {}, true);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    },
    async getDiskList(param) {
        let result = {};
        try {
            let res = await fileSystem.getDiskList(param);
            if (!res.errorId) {
                result = responseHandler(0, res.data);
            } else {
                result = responseHandler(22, res.message, param);
            }
        } catch (error) {
            result = responseHandler(22, error, param);
        }
        return result;
    }
};
module.exports = model;