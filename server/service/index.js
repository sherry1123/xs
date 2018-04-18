const os = require('os');
const email = require('./email');
const config = require('../config');
const init = require('./initialize');
const database = require('./database');
const snapshot = require('./snapshot');
const socket = require('../module/socket');
const logger = require('../module/logger');
const fileSystem = require('./filesystem');
const promise = require('../module/promise');
const request = require('../module/request');
const handler = require('../module/handler');
const model = {
    async getInitStatus() {
        let result = false;
        try {
            result = await init.getOrcaFSStatus();
        } catch (error) {
            handler.error(1, error);
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
            } catch (error) {
                handler.error(2, error);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(6, error, param);
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
        let current = 0, total = 8;
        try {
            let { mongodbParam, orcafsParam, nodelist } = init.handleInitParam(param);
            let res = await init.initOrcaFS(orcafsParam);
            if (!res.errorId) {
                let getInitProgress = setInterval(async () => {
                    let progress = await init.getOrcaFSInitProgress();
                    if (!progress.errorId) {
                        let { currentStep, describle, errorMessage, status, totalStep } = progress.data;
                        if (status) {
                            clearInterval(getInitProgress);
                            socket.postInitStatus({ current: currentStep, status, total });
                            handler.error(7, errorMessage, param);
                        } else if (currentStep !== totalStep) {
                            socket.postInitStatus({ current: currentStep, status, total });
                        } else if (describle.includes('finish')) {
                            clearInterval(getInitProgress);
                            current = 5;
                            socket.postInitStatus({ current, status: 0, total });
                            await init.initMongoDB(mongodbParam);
                            current = 6;
                            socket.postInitStatus({ current, status: 0, total });
                            await init.saveInitInfo({ nodelist, initparam: param });
                            socket.postInitStatus({ current: 7, status: 0, total });
                            init.setInitStatus(true);
                            logger.info('init successfully');
                            await model.restartServer(nodelist);
                        }
                    }
                }, 1000);
            } else {
                handler.error(7, res.message, param);
                socket.postInitStatus({ current, status: -1, total });
            }
        } catch (error) {
            handler.error(7, error, param);
            await model.antiInitCluster(2);
            socket.postInitStatus({ current, status: -1, total });
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
            mode === 1 && await init.antiInitOrcaFS();
            let getAntiinitProgress = setInterval(async () => {
                let progress = await init.getOrcaFSInitProgress();
                if (!progress.errorId) {
                    let { currentStep, describle, errorMessage, status, totalStep } = progress.data;
                    if (status) {
                        clearInterval(getAntiinitProgress);
                        handler.error(8, errorMessage, mode);
                    } else if (!currentStep && describle.includes('finish')) {
                        clearInterval(getAntiinitProgress);
                        let mongodbStatus = await init.getMongoDBStatus();
                        let nodelist = ['127.0.0.1'];
                        if (mongodbStatus) {
                            nodelist = await database.getSetting({ key: 'nodelist' });
                            await init.antiInitMongoDB(nodelist);
                        }
                        logger.info('antiinit successfully');
                        await model.restartServer(nodelist);
                    }
                }
            }, 1000);
        } catch (error) {
            handler.error(8, error, mode);
        }
    },
    /**
     * Login
     * 
     * @param {string} username Username
     * @param {string} password Password
     */
    async login(param, ip) {
        let { username, password } = param;
        let result = {};
        try {
            let data = await database.login({ username, password });
            if (data.username) {
                await model.addAuditLog({ user: username, desc: 'login successfully', ip });
                result = handler.response(0, data);
            } else {
                result = handler.response(9, 'username or password error', param);
            }
        } catch (error) {
            result = handler.response(9, error, param);
        }
        return result;
    },
    /**
     * Logout
     * 
     * @param {string} username Username
     */
    async logout(param, ip) {
        let { username } = param;
        let result = handler.response(0, 'logout successfully');
        await model.addAuditLog({ user: username, desc: 'logout successfully', ip });
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(10, error, param);
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
            result = handler.response(0, 'create user successfully');
        } catch (error) {
            result = handler.response(11, error, param);
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
    async updateUser(param, ip) {
        let query = { username: param.username };
        let result = {};
        try {
            await database.updateUser(query, param);
            result = handler.response(0, 'change password successfully');
            await model.addAuditLog({ user: param.username, desc: 'change password successfully', ip });
        } catch (error) {
            result = handler.response(12, error, param);
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
            result = handler.response(0, 'delete user successfully');
        } catch (error) {
            result = handler.response(13, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(14, error, param);
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
        let { time = new Date(), node = os.hostname(), desc, level = 1, source = 'orcafs-gui', read = false } = param;
        try {
            await database.addEventLog({ time, node, desc, level, source, read });
        } catch (error) {
            handler.error(15, error, param);
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
            result = handler.response(0, 'update event log successfully');
        } catch (error) {
            result = handler.response(16, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(17, error, param);
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
            handler.error(18, error, param);
        }
    },
    /**
    * Get Hardware
    */
    async getHardware(param) {
        let result = {};
        try {
            let data = await database.getHardware(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(19, error, param);
        }
        return result;
    },
    async runHardwareTask() {
        let date = new Date();
        let api = config.api.agentd.hardware;
        let url = api;
        try {
            let ipList = await database.getSetting({ key: 'nodelist' });
            let data = [];
            for (let ip of ipList) {
                url = api.replace('localhost', ip);
                let res = await request.get(url, {}, {}, true);
                data.push(res);
            }
            await database.addHardware({ date, ipList, data });
        } catch (error) {
            handler.error(20, error, url);
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
            result = handler.response(0, 'test mail successfully');
        } catch (error) {
            result = handler.response(21, error, param);
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
            handler.error(22, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(23, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(24, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(25, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(26, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(27, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(28, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(29, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(30, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(31, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(32, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(33, error, param);
        }
        return result;
    },
    async getMetaNodesStatus(param) {
        let result = {};
        try {
            let res = await fileSystem.getMetaNodesStatus(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(34, res.message, param);
            }
        } catch (error) {
            result = handler.response(34, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(35, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(36, error, param);
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
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(37, error, param);
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
                result = handler.response(0, res.data);
            } else {
                result = handler.response(38, res.message, param);
            }
        } catch (error) {
            result = handler.response(38, error, param);
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
                result = handler.response(0, res.data);
            } else {
                result = handler.response(39, res.message, param);
            }
        } catch (error) {
            result = handler.response(39, error, param);
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
                result = handler.response(0, res.data);
            } else {
                result = handler.response(40, res.message, param);
            }
        } catch (error) {
            result = handler.response(40, error, param);
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
    async setPattern(param, user, ip) {
        let result = {};
        try {
            let res = await fileSystem.setPattern(param);
            if (!res.errorId) {
                result = handler.response(0, 'set pattern successfully');
                await model.addAuditLog({ user, desc: 'set pattern successfully', ip });
            } else {
                result = handler.response(41, res.message, param);
                await model.addAuditLog({ user, desc: `set pattern failed`, ip });
                await model.addEventLog({ desc: `set pattern failed, reason: ${res.message}` });
            }
        } catch (error) {
            result = handler.response(41, error, param);
            await model.addAuditLog({ user, desc: `set pattern failed`, ip });
            await model.addEventLog({ desc: `set pattern failed. reason: ${error}` });
        }
        return result;
    },
    async restartServer(nodelist) {
        let command = 'service orcafs-gui restart';
        nodelist = nodelist.reverse();
        for (let i = 0; i < nodelist.length; i++) {
            i === nodelist.length - 1 ? await promise.runCommandInPromise(command) : await promise.runCommandInRemoteNodeInPromise(nodelist[i], command);
        }
    },
    async getSnapshot(param) {
        let result = {};
        try {
            let data = await snapshot.getSnapshot(param);
            result = handler.response(0, data.reverse());
        } catch (error) {
            result = handler.response(42, error, param);
        }
        return result;
    },
    async createSnapshot(param, user, ip) {
        let result = {};
        try {
            if (await snapshot.createSnapshot(param)) {
                result = handler.response(0, 'create snapshot successfully');
                await model.addAuditLog({ user, desc: 'create snapshot successfully', ip });
            } else {
                result = handler.response(43, 'the number of snapshots has reached the limit', param);
                await model.addAuditLog({ user, desc: `create snapshot failed`, ip });
                await model.addEventLog({ desc: 'create snapshot failed. reason: the number of snapshots has reached the limit' });
            }
        } catch (error) {
            result = handler.response(43, error, param);
            await model.addAuditLog({ user, desc: `create snapshot failed`, ip });
            await model.addEventLog({ desc: `create snapshot failed. reason: ${error}` });
        }
        return result;
    },
    async deleteSnapshot(param, user, ip) {
        try {
            await snapshot.deleteSnapshot(param);
            await model.addAuditLog({ user, desc: 'delete snapshot successfully', ip });
            socket.postEventStatus({ channel: 'snapshot', code: 1, target: param.name, result: true });
        } catch (error) {
            handler.error(44, error, param);
            await model.addAuditLog({ user, desc: `delete snapshot failed`, ip });
            await model.addEventLog({ desc: `delete snapshot failed. reason: ${error}` });
            socket.postEventStatus({ channel: 'snapshot', code: 2, target: param.name, result: false });
        }
    },
    async rollbackSnapshot(param, user, ip) {
        try {
            process.send('rollback start');
            await snapshot.rollbackSnapshot(param);
            process.send('rollback end');
            await model.addAuditLog({ user, desc: 'rollback snapshot successfully', ip });
            socket.postEventStatus({ channel: 'snapshot', code: 3, target: param.name, result: true });
        } catch (error) {
            snapshot.setRollbackStatus(false);
            handler.error(45, error, param);
            await model.addAuditLog({ user, desc: `rollback snapshot failed`, ip });
            await model.addEventLog({ desc: `rollback snapshot failed. reason: ${error}` });
            socket.postEventStatus({ channel: 'snapshot', code: 4, target: param.name, result: false });
        }
    },
    async getUserMetaStats(param) {
        let result = {};
        try {
            let res = await fileSystem.getUserMetaStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(46, res.message, param);
            }
        } catch (error) {
            result = handler.response(46, error, param);
        }
        return result;
    },
    async getUserStorageStats(param) {
        logger.info(param);
        let result = {};
        try {
            let res = await fileSystem.getUserStorageStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(47, res.message, param);
            }
        } catch (error) {
            result = handler.response(47, error, param);
        }
        return result;
    },
    async getClientMetaStats(param) {
        let result = {};
        try {
            let res = await fileSystem.getClientMetaStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(48, res.message, param);
            }
        } catch (error) {
            result = handler.response(48, error, param);
        }
        return result;
    },
    async getClientStorageStats(param) {
        let result = {};
        try {
            let res = await fileSystem.getClientStorageStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(49, res.message, param);
            }
        } catch (error) {
            result = handler.response(49, error, param);
        }
        return result;
    },
    async getSnapshotTask(param) {
        let result = {};
        try {
            let data = await snapshot.getSnapshotTask(param);
            result = handler.response(0, data.reverse());
        } catch (error) {
            result = handler.response(50, error, param);
        }
        return result;
    },
    async createSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.createSnapshotTask(param);
            result = handler.response(0, 'create snapshot task successfully');
            await model.addAuditLog({ user, desc: 'create snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(51, error, param);
            await model.addAuditLog({ user, desc: `create snapshot task failed`, ip });
            await model.addEventLog({ desc: `create snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async enableSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.enableSnapshotTask(param);
            result = handler.response(0, 'enable snapshot task successfully');
            await model.addAuditLog({ user, desc: 'enable snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(52, error, param);
            await model.addAuditLog({ user, desc: `enable snapshot task failed`, ip });
            await model.addEventLog({ desc: `enable snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async disableSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.disableSnapshotTask(param);
            result = handler.response(0, 'disable snapshot task successfully');
            await model.addAuditLog({ user, desc: 'disable snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(53, error, param);
            await model.addAuditLog({ user, desc: `disable snapshot task failed`, ip });
            await model.addEventLog({ desc: `disable snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async deleteSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.deleteSnapshotTask(param);
            result = handler.response(0, 'delete snapshot task successfully');
            await model.addAuditLog({ user, desc: 'delete snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(54, error, param);
            await model.addAuditLog({ user, desc: `delete snapshot task failed`, ip });
            await model.addEventLog({ desc: `delete snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async getSnapshotSetting(param) {
        let result = {};
        try {
            let data = await snapshot.getSnapshotSetting();
            for (let i of Object.keys(data)) {
                data[i] = Number(data[i]);
            }
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(55, error, param);
        }
        return result;
    },
    async updateSnapshotSetting(param, user, ip) {
        let result = {};
        try {
            await snapshot.updateSnapshotSetting(param);
            result = handler.response(0, 'update snapshot setting successfully');
            await model.addAuditLog({ user, desc: 'update snapshot setting successfully', ip });
        } catch (error) {
            result = handler.response(56, error, param);
            await model.addAuditLog({ user, desc: `update snapshot setting failed`, ip });
            await model.addEventLog({ desc: `update snapshot setting failed. reason: ${error}` });
        }
        return result;
    },
    async getNasExport(param) {
        let result = {};
        try {
            let data = await database.getNasExport(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(57, error, param);
        }
        return result;
    },
    async createNasExport(param, user, ip) {
        let { path, protocol, description } = param;
        protocol = protocol.toUpperCase();
        let result = {};
        try {
            await database.createNasExport({ path, protocol, description });
            result = handler.response(0, 'create nas export successfully');
            await model.addAuditLog({ user, desc: 'create nas export successfully', ip });
        } catch (error) {
            result = handler.response(58, error, param);
            await model.addAuditLog({ user, desc: `create nas export failed`, ip });
            await model.addEventLog({ desc: `create nas export failed. reason: ${error}` });
        }
        return result;
    },
    async deleteNasExport(param, user, ip) {
        let result = {};
        try {
            await database.deleteNasExport(param);
            result = handler.response(0, 'delete nas export successfully');
            await model.addAuditLog({ user, desc: 'delete nas export successfully', ip });
        } catch (error) {
            result = handler.response(59, error, param);
            await model.addAuditLog({ user, desc: `delete nas export failed`, ip });
            await model.addEventLog({ desc: `delete nas export failed. reason: ${error}` });
        }
        return result;
    },
    async updateNasExport(param, user, ip) {
        let query = { path: param.path, protocol: param.protocol };
        let result = {};
        try {
            await database.updateNasExport(query, param);
            result = handler.response(0, 'update nas export successfully');
            await model.addAuditLog({ user, desc: 'update nas export successfully', ip });
        } catch (error) {
            result = handler.response(62, error, param);
            await model.addAuditLog({ user, desc: `update nas export failed`, ip });
            await model.addEventLog({ desc: `update nas export failed. reason: ${error}` });
        }
        return result;
    },
    async deleteSnapshots(param, user, ip) {
        try {
            await snapshot.deleteSnapshots(param);
            model.sendEvent({ channel: 'snapshot', target: param.names, info: { user, ip } });
            await model.addAuditLog({ user, desc: 'start to delete snapshots successfully', ip });
        } catch (error) {
            handler.error(60, error, param);
            await model.addAuditLog({ user, desc: `start to delete snapshots failed`, ip });
            await model.addEventLog({ desc: `start to delete snapshots failed. reason: ${error}` });
        }
    },
    async sendEvent(param) {
        let { channel, target, info } = param;
        for (let i in target) {
            target[i] = { name: target[i], result: Math.random() > 0.5 ? true : false };
        }
        await promise.runTimeOutInPromise(10);
        await request.post('http://localhost/api/receiveevent', { channel, code: target.filter(snapshot => (snapshot.result)).length === target.length ? 5 : 6, target, info }, {}, true);

    },
    async receiveEvent(param) {
        let { channel, code, target, info: { user, ip } } = param;
        switch (code) {
            case 5:
                for (let snapshot of target) {
                    await database.deleteSnapshot({ name: snapshot.name });
                }
                await model.addAuditLog({ user, desc: 'delete snapshots successfully', ip });
                socket.postEventStatus({ channel, code, target: { total: target.length, success: target.length, failed: 0 }, result: true });
                break;
            case 6:
                let success = target.filter(snapshot => (snapshot.result)).length;
                for (let snapshot of target) {
                    if (snapshot.result) {
                        await database.deleteSnapshot({ name: snapshot.name });
                    } else {
                        await database.updateSnapshot({ name: snapshot.name }, { deleting: false });
                    }
                }
                await model.addAuditLog({ user, desc: `delete snapshots failed`, ip });
                await model.addEventLog({ desc: `delete snapshots failed. total: ${target.length}, success: ${success}, failed: ${target.length - success}`, level: 2, source: 'orcafs' });
                socket.postEventStatus({ channel, code, target: { total: target.length, success, failed: target.length - success }, result: false });
                break;
        }
    },
    async runSnapshotTask() {
        try {
            await snapshot.runSnapshotTask();
        } catch (error) {
            handler.error(63, error);
        }
    }
};
module.exports = model;