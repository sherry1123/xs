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
        return { code, message: result ? typeof result === 'object' ? result.message || '' : result : '' };
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
            process.exit(1);
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
     * @param {array} meta Metadata Servers
     * @param {array} storage Object Storage Servers
     * @param {array} client Client Servers
     * @param {array} mgmt Management Servers
     * @param {boolean} HA High Availability
     * @param {array} floatIP Cluster Service Management IP
     * @param {array} heartbeatIP Heart Beat IP
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
     * First initialize the file system, and then the database, finally save the initialization information.
     * 
     * @param {array} meta Metadata Servers
     * @param {array} storage Object Storage Servers
     * @param {array} client Client Servers
     * @param {array} mgmt Management Servers
     * @param {boolean} HA High Availability
     * @param {array} floatIP Cluster Service Management IP
     * @param {array} heartbeatIP Heart Beat IP
     * @param {boolean} RAID Redundant Array Of Independent Disks
     * @param {object} RAIDConfig  RAID Config
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
     * @param {number} mode 1 => All; 2 => Only Database
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
     * @param {string} username Username
     * @param {string} password Password
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
     * @param {string} username Username
     */
    async logout(param) {
        let result = responseHandler(0, 'logout success');
        await model.addAuditLog({ user: param.username, desc: 'logout success' });
        return result;
    },
    /**
    * Get User
    * 
    * @param {string} username Username
    * @param {string} password Password
    * @param {string} email Email
    * @param {string} firstname First Name
    * @param {string} lastname Last Name
    * @param {string} group Group
    * @param {string} type Type
    * @param {boolean} receivemail Receive Email Or Not
    * @param {int} useravatar User Avatar
    */
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
    /**
    * Add User
    * 
    * @param {string} username Username
    * @param {string} password Password
    * @param {string} email Email
    * @param {string} firstname First Name
    * @param {string} lastname Last Name
    * @param {string} group Group
    * @param {string} type Type
    * @param {boolean} receivemail Receive Email Or Not
    * @param {int} useravatar User Avatar
    */
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
    /**
     * Update User
     * 
     * @param {string} username Username
     * @param {string} password Password
     * @param {string} email Email
     * @param {string} firstname First Name
     * @param {string} lastname Last Name
     * @param {string} group Group
     * @param {string} type Type
     * @param {boolean} receivemail Receive Email Or Not
     * @param {int} useravatar User Avatar
     */
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
    /**
     * Delete User
     * 
     * @param {string} username Username
     * @param {string} password Password
     */
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
    /**
     * Get Event Log
     * 
     * @param {date} date Date
     * @param {string} node Node
     * @param {string} desc Description
     * @param {int} level Level
     * @param {string} source Source
     * @param {boolean} read Read Or Not
     */
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
    /**
     * Add Event Log
     * 
     * @param {date} date Date
     * @param {string} node Node
     * @param {string} desc Description
     * @param {int} level Level
     * @param {string} source Source
     * @param {boolean} read Read Or Not
     */
    async addEventLog(param) {
        let { time = new Date(), node = 'cluster', desc, level = 1, source = 'nodejs', read = false } = param;
        try {
            await database.addEventLog({ time, node, desc, level, source, read });
        } catch (error) {
            errorHandler(15, error, param);
        }
    },
    /**
     * Update Event Log
     * 
     * @param {date} date Date
     * @param {string} node Node
     * @param {string} desc Description
     * @param {int} level Level
     * @param {string} source Source
     * @param {boolean} read Read Or Not
     */
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
    /**
    * Get Audit Log
    * 
    * @param {date} date Date
    * @param {string} user User
    * @param {string} group User Group
    * @param {string} desc Description
    * @param {int} level Level
    * @param {string} ip User IP
    */
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
    /**
    * Get Audit Log
    * 
    * @param {date} date Date
    * @param {string} user User
    * @param {string} group User Group
    * @param {string} desc Description
    * @param {int} level Level
    * @param {string} ip User IP
    */
    async addAuditLog(param) {
        let { time = new Date(), user, group = 'admin', desc, level = 1, ip = '127.0.0.1' } = param;
        try {
            await database.addAuditLog({ time, user, group, desc, level, ip });
        } catch (error) {
            errorHandler(18, error, param);
        }
    },
    /**
    * Get Hardware
    */
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
    /**
     * Test Mail
     * 
     * @param {string} host SMTP Address
     * @param {int} port SMTP Relay Port
     * @param {boolean} secure Protection
     * @param {string} user Username
     * @param {string} pass Password
     * @param {string} from Sender's Email
     * @param {string} to Receiver's Email
     * @param {string} subject Subject
     * @param {string} text Email Text
     * @param {string} html Email Html
     */
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
    /**
     * Send Mail
     * 
     * @param {string} host SMTP Address
     * @param {int} port SMTP Relay Port
     * @param {boolean} secure Protection
     * @param {string} user Username
     * @param {string} pass Password
     * @param {string} from Sender's Email
     * @param {string} to Receiver's Email
     * @param {string} subject Subject
     * @param {string} text Email Text
     * @param {string} html Email Html
     */
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
     * @param {boolean} clients Get Client Nodes Or Not
     * @param {boolean} admon Get Admon Node Or Not
     */
    async getNodeList(param) {
        let result = {};
        try {
            let data = await fileSystem.getNodeList(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(23, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Nodes Overview
     * 
     * @param {int} timeSpanRequests The Length Of Statistical Time, The Unit Is Minute, The Interval Is One Second
     */
    async getMetaNodesOverview(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNodesOverview(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(24, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Node Detail
     * 
     * @param {int} timeSpanRequests The Length Of Statistical Time, The Unit Is Minute, The Interval Is One Second
     * @param {string} node Node's Hostname
     * @param {int} nodeNumID Node's ID
     */
    async getMetaNode(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNode(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(25, error, param);
        }
        return result;
    },
    /**
     * Get Storage Nodes Overview
     * 
     * @param {string} group The Group Which The Node Belongs
     */
    async getStorageNodesOverview(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNodesOverview(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(26, error, param);
        }
        return result;
    },
    /**
     * Get Storage Node Detail
     * 
     * @param {string} node Node's Hostname
     * @param {int} nodeNumID Node's ID
     */
    async getStorageNode(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNode(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(27, error, param);
        }
        return result;
    },
    /**
     * Get Client Stats
     * 
     * @param {int} nodeType Node's Type, 1 => Meta, 2 => Storage
     * @param {int} interval Interval, The Unit Is Second
     * @param {int} numLines The Number Of Clients
     * @param {int} requestorID The ID Of The Requestor
     * @param {int} nextDataSequenceID The Next Data Sequence's ID
     */
    async getClientStats(param) {
        let result = {};
        try {
            let data = await fileSystem.getClientStats(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(28, error, param);
        }
        return result;
    },
    /**
     * Get User Stats
     * 
     * @param {int} nodeType Node's Type, 1 => Meta, 2 => Storage
     * @param {int} interval Interval, The Unit Is Second
     * @param {int} numLines The Number Of Clients
     * @param {int} requestorID The ID Of The Requestor
     * @param {int} nextDataSequenceID The Next Data Sequence's ID
     */
    async getUserStats(param) {
        let result = {};
        try {
            let data = await fileSystem.getUserStats(param);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(29, error, param);
        }
        return result;
    },
    /**
     * Get Storage Nodes Status And Disk Summary
     * 
     * @param {string} group The Group Which The Node Belongs
     */
    async getStorageNodesStatusAndDIskSummary(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNodesOverview(param);
            data = { status: data.status, diskSpace: data.diskSpace };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(30, error, param);
        }
        return result;
    },
    /**
     * Get Storage Nodes Throughput
     * 
     * @param {string} group The Group Which The Node Belongs
     */
    async getStorageNodesThroughput(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNodesOverview(param);
            data = { diskPerfRead: data.diskPerfRead, diskPerfWrite: data.diskPerfWrite };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(31, error, param);
        }
        return result;
    },
    /**
     * Get Storage Node Status And Disk Summary
     * 
     * @param {int} timeSpanRequests The Length Of Statistical Time, The Unit Is Minute, The Interval Is One Second
     * @param {string} node Node's Hostname
     * @param {int} nodeNumID Node's ID
     */
    async getStorageNodeStatusAndDIskSummary(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNode(param);
            data = { general: data.general, storageTargets: data.storageTargets };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(32, error, param);
        }
        return result;
    },
    /**
     * Get Storage Node Throughput
     * 
     * @param {int} timeSpanRequests The Length Of Statistical Time, The Unit Is Minute, The Interval Is One Second
     * @param {string} node Node's Hostname
     * @param {int} nodeNumID Node's ID
     */
    async getStorageNodeThroughput(param) {
        let result = {};
        try {
            let data = await fileSystem.getStorageNode(param);
            data = { diskPerfRead: data.diskPerfRead, diskPerfWrite: data.diskPerfWrite };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(33, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Nodes Status
     * 
     * @param {int} timeSpanRequests The Length Of Statistical Time, The Unit Is Minute, The Interval Is One Second
     */
    async getMetaNodesStatus(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNodesOverview(param);
            data = { general: data.general, status: data.status };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(34, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Nodes Request
     * 
     * @param {int} interval Interval, The Unit Is Second
     * @param {int} numLines The Number Of Clients
     * @param {int} requestorID The ID Of The Requestor
     * @param {int} nextDataSequenceID The Next Data Sequence's ID
     */
    async getMetaNodesRequest(param) {
        let result = {};
        try {
            let data = await request.get(config.api.agentd.metanodes, param, {}, true);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(35, error, param);
        }
        return result;
    },
    /**
     * Get Metadata Node Status
     * 
     * @param {int} timeSpanRequests The Length Of Statistical Time, The Unit Is Minute, The Interval Is One Second
     * @param {string} node Node's Hostname
     * @param {int} nodeNumID Node's ID
     */
    async getMetaNodeStatus(param) {
        let result = {};
        try {
            let data = await fileSystem.getMetaNode(param);
            data = { general: data.general };
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(36, error, param);
        }
        return result;
    },
    /**
     * Get Known Problems
     */
    async getKnownProblems(param) {
        let result = {};
        try {
            let data = await request.get(config.api.agentd.knownproblems, param, {}, true);
            result = responseHandler(0, data);
        } catch (error) {
            result = responseHandler(37, error, param);
        }
        return result;
    },
    /**
     * Get Disk List
     * 
     * @param {string} ip Node's IP
     */
    async getDiskList(param) {
        let result = {};
        try {
            let res = await fileSystem.getDiskList(param);
            if (!res.errorId) {
                result = responseHandler(0, res.data);
            } else {
                result = responseHandler(38, res.message, param);
            }
        } catch (error) {
            result = responseHandler(38, error, param);
        }
        return result;
    },
    /**
     * Get Entry Info
     * 
     * @param {string} dir Entry Path
     */
    async getEntryInfo(param) {
        let result = {};
        try {
            let res = await fileSystem.getEntryInfo(param);
            if (!res.errorId) {
                result = responseHandler(0, res.data);
            } else {
                result = responseHandler(39, res.message, param);
            }
        } catch (error) {
            result = responseHandler(39, error, param);
        }
        return result;
    },
    /**
     * Get Entry Info
     * 
     * @param {string} dir Entry Path
     */
    async getFiles(param) {
        let result = {};
        try {
            let res = await fileSystem.getFiles(param);
            if (!res.errorId) {
                result = responseHandler(0, res.data);
            } else {
                result = responseHandler(40, res.message, param);
            }
        } catch (error) {
            result = responseHandler(40, error, param);
        }
        return result;
    },
    /**
     * Get Entry Info
     * 
     * @param {string} chunkSize Chunk Size
     * @param {string} numTargets The Number Of Targets
     * @param {string} dirPath Dir Path
     * @param {int} buddyMirror Buddy Mirror
     */
    async setPattern(param) {
        let result = {};
        try {
            let res = await fileSystem.setPattern(param);
            if (!res.errorId) {
                result = responseHandler(0, 'set pattern successfully');
            } else {
                result = responseHandler(41, res.message, param);
            }
        } catch (error) {
            result = responseHandler(41, error, param);
        }
        return result;
    },
    /**
     * Get Init Cache
     */
    getInitCache() {
        return responseHandler(0, { status: init.getInitStatus() ? true : false });
    },
};
module.exports = model;