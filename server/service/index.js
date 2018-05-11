const log = require('./log');
const email = require('./email');
const status = require('./status');
const config = require('../config');
const init = require('./initialize');
const afterMe = require('./afterMe');
const database = require('./database');
const snapshot = require('./snapshot');
const socket = require('../module/socket');
const logger = require('../module/logger');
const handler = require('../module/handler');
const model = {
    async checkClusterEnv(param) {
        let result = {};
        try {
            let data = await init.checkClusterEnv(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(31, error, param);
        }
        return result;
    },
    async getRaidRecommendedConfiguration(param) {
        let result = {};
        try {
            let data = await init.getRaidRecommendedConfiguration(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(32, error, param);
        }
        return result;
    },
    async getDiskList(param) {
        let result = {};
        try {
            let res = await afterMe.getDiskList(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(33, res.message, param);
            }
        } catch (error) {
            result = handler.response(33, error, param);
        }
        return result;
    },
    async initCluster(param) {
        let current = 0, total = 8;
        try {
            let { mongodbParam, orcafsParam, nodeList } = init.handleInitParam(param);
            let res = await init.initOrcaFS(orcafsParam);
            if (!res.errorId) {
                let getInitProgress = setInterval(async () => {
                    let { errorId, data: { currentStep, describle, errorMessage, status, totalStep } } = await init.getOrcaFSInitProgress();
                    if (!errorId) {
                        if (status) {
                            clearInterval(getInitProgress);
                            socket.postInitStatus(currentStep, -1, total);
                            handler.error(41, errorMessage, param);
                        } else if (currentStep !== totalStep) {
                            socket.postInitStatus(currentStep, status, total);
                        } else if (describle.includes('finish')) {
                            clearInterval(getInitProgress);
                            current = 5;
                            socket.postInitStatus(current, 0, total);
                            await init.initMongoDB(mongodbParam);
                            current = 6;
                            socket.postInitStatus(current, 0, total);
                            await init.saveInitInfo({ nodeList, initParam: param });
                            current = 7;
                            init.setInitStatus(true);
                            socket.postInitStatus(current, 0, total);
                            logger.info('initialize the cluster successfully');
                            await init.restartServer(nodeList);
                        }
                    } else {
                        clearInterval(getInitProgress);
                        socket.postInitStatus(currentStep, -1, total);
                        handler.error(41, errorMessage, param);
                    }
                }, 1000);
            } else if (res.errorId !== 111) {
                handler.error(41, res.message, param);
                socket.postInitStatus(current, -1, total);
            }
        } catch (error) {
            handler.error(41, error, param);
            await model.antiInitCluster(2);
            socket.postInitStatus(current, -1, total);
        }
    },
    async antiInitCluster(mode) {
        try {
            process.send('de-initialize start');
            socket.postEventStatus('cluster', 1, 'cluster', true, true);
            mode === 1 && await init.antiInitOrcaFS();
            let getAntiinitProgress = setInterval(async () => {
                let progress = await init.getOrcaFSInitProgress();
                if (!progress.errorId) {
                    let { currentStep, describle, errorMessage, status, totalStep } = progress.data;
                    if (status) {
                        clearInterval(getAntiinitProgress);
                        process.send('de-initialize end');
                        socket.postEventStatus('cluster', 2, 'cluster', false, true);
                        handler.error(42, errorMessage, mode);
                    } else if (!currentStep && describle.includes('finish')) {
                        clearInterval(getAntiinitProgress);
                        let mongodbStatus = await init.getMongoDBStatus();
                        let nodeList = ['127.0.0.1'];
                        if (mongodbStatus) {
                            nodeList = await database.getSetting({ key: config.setting.nodeList });
                            await init.antiInitMongoDB(nodeList);
                        }
                        process.send('de-initialize end');
                        socket.postEventStatus('cluster', 2, 'cluster', true, true);
                        logger.info('de-initialize the cluster successfully');
                        await init.restartServer(nodeList);
                    }
                }
            }, 1000);
        } catch (error) {
            process.send('de-initialize end');
            socket.postEventStatus('cluster', 2, 'cluster', false, true);
            handler.error(42, error, mode);
        }
    },
    async receiveEvent(param) {
        let { channel, code, target, result = false, notify } = param;
        socket.postEventStatus(channel, code, target, result, notify);
    },
    async login(param, ip) {
        let { username, password } = param;
        let result = {};
        try {
            let data = await database.login({ username, password });
            if (data) {
                await log.audit({ user: username, desc: 'login successfully', ip });
                result = handler.response(0, data);
            } else {
                result = handler.response(51, 'username or password error', param);
            }
        } catch (error) {
            result = handler.response(51, error, param);
        }
        return result;
    },
    async logout(param, ip) {
        let { username } = param;
        let result = handler.response(0, 'logout successfully');
        await log.audit({ user: username, desc: 'logout successfully', ip });
        return result;
    },
    async getUser(param) {
        let result = {};
        try {
            let data = await database.getUser(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(52, error, param);
        }
        return result;
    },
    async addUser(param) {
        let result = {};
        try {
            await database.addUser(param)
            result = handler.response(0, 'create user successfully');
        } catch (error) {
            result = handler.response(53, error, param);
        }
        return result;
    },
    async updateUser(param, ip) {
        let query = { username: param.username };
        let result = {};
        try {
            await database.updateUser(query, param);
            result = handler.response(0, 'update user successfully');
            await log.audit({ user: param.username, desc: `update user <${param.username}> successfully`, ip });
        } catch (error) {
            result = handler.response(54, error, param);
        }
        return result;
    },
    async deleteUser(param) {
        let result = {};
        try {
            await database.deleteUser(param);
            result = handler.response(0, 'delete user successfully');
        } catch (error) {
            result = handler.response(55, error, param);
        }
        return result;
    },
    async testMail(param) {
        let result = {};
        try {
            await email.sendMail(param);
            result = handler.response(0, 'test mail successfully');
        } catch (error) {
            result = handler.response(61, error, param);
        }
        return result;
    },
    async getHardware(param) {
        let result = {};
        try {
            let data = await database.getHardware(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(71, error, param);
        }
        return result;
    },
    async getMetaNodeStatus(param) {
        let result = {};
        try {
            let res = await afterMe.getMetaNodeStatus(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(81, res.message, param);
            }
        } catch (error) {
            result = handler.response(81, error, param);
        }
        return result;
    },
    async getStorageNodeStatus(param) {
        let result = {};
        try {
            let res = await afterMe.getStorageNodeStatus(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(91, res.message, param);
            }
        } catch (error) {
            result = handler.response(91, error, param);
        }
        return result;
    },
    async getStorageDiskSpace(param) {
        let result = {};
        try {
            let res = await afterMe.getStorageDiskSpace(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(92, res.message, param);
            }
        } catch (error) {
            result = handler.response(92, error, param);
        }
        return result;
    },
    async getStorageTarget(param) {
        let result = {};
        try {
            let res = await afterMe.getStorageTarget(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(93, res.message, param);
            }
        } catch (error) {
            result = handler.response(93, error, param);
        }
        return result;
    },
    async getStorageThroughput(param) {
        let result = {};
        try {
            let res = await afterMe.getStorageThroughput(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(94, res.message, param);
            }
        } catch (error) {
            result = handler.response(94, error, param);
        }
        return result;
    },
    async getClientMetaStats(param) {
        let result = {};
        try {
            let res = await afterMe.getClientMetaStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(101, res.message, param);
            }
        } catch (error) {
            result = handler.response(101, error, param);
        }
        return result;
    },
    async getClientStorageStats(param) {
        let result = {};
        try {
            let res = await afterMe.getClientStorageStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(102, res.message, param);
            }
        } catch (error) {
            result = handler.response(102, error, param);
        }
        return result;
    },
    async getUserMetaStats(param) {
        let result = {};
        try {
            let res = await afterMe.getUserMetaStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(111, res.message, param);
            }
        } catch (error) {
            result = handler.response(111, error, param);
        }
        return result;
    },
    async getUserStorageStats(param) {
        let result = {};
        try {
            let res = await afterMe.getUserStorageStats(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(112, res.message, param);
            }
        } catch (error) {
            result = handler.response(112, error, param);
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
            result = handler.response(121, error, param);
        }
        return result;
    },
    async updateSnapshotSetting(param, user, ip) {
        let result = {};
        try {
            await snapshot.updateSnapshotSetting(param);
            result = handler.response(0, 'update snapshot setting successfully');
            await log.audit({ user, desc: `update snapshot setting successfully`, ip });
        } catch (error) {
            result = handler.response(122, error, param);
            await log.audit({ user, desc: `update snapshot setting failed`, ip });
        }
        return result;
    },
    async getSnapshot(param) {
        let result = {};
        try {
            let data = await snapshot.getSnapshot(param);
            result = handler.response(0, data.reverse());
        } catch (error) {
            result = handler.response(131, error, param);
        }
        return result;
    },
    async createSnapshot(param, user, ip) {
        try {
            let result = await snapshot.createSnapshot(param);
            await log.audit({ user, desc: `create snapshot '${param.name}' ${result ? 'successfully' : 'failed'}`, ip });
        } catch (error) {
            await log.audit({ user, desc: `create snapshot '${param.name}' failed`, ip });
        }
    },
    async updateSnapshot(param, user, ip) {
        let result = {};
        try {
            await snapshot.updateSnapshot(param);
            await log.audit({ user, desc: `update snapshot '${param.name}' successfully`, ip });
        } catch (error) {
            result = handler.response(133, error, param);
            await log.audit({ user, desc: `update snapshot '${param.name}' failed`, ip });
        }
        return result;
    },
    async deleteSnapshot(param, user, ip) {
        try {
            await snapshot.deleteSnapshot(param);
            await log.audit({ user, desc: `delete snapshot '${param.name}' successfully`, ip });
            socket.postEventStatus('snapshot', 13, param.name, true, true);
        } catch (error) {
            handler.error(134, error, param);
            await log.audit({ user, desc: `delete snapshot '${param.name}' failed`, ip });
            socket.postEventStatus('snapshot', 14, param.name, false, true);
        }
    },
    async batchDeleteSnapshot(param, user, ip) {
        try {
            await snapshot.batchDeleteSnapshot(param);
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshots '${String(handler.bypass(param.names))}' successfully`, ip });
            socket.postEventStatus('snapshot', 15, { total: param.names.length }, true, true);
        } catch (error) {
            handler.error(135, error, param);
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshots '${String(handler.bypass(param.names))}' failed`, ip });
            socket.postEventStatus('snapshot', 16, { total: param.names.length }, false, true);
        }
    },
    async rollbackSnapshot(param, user, ip) {
        try {
            process.send('rollback start');
            socket.postEventStatus('snapshot', 17, param.name, true, true);
            await snapshot.rollbackSnapshot(param);
            process.send('rollback end');
            await log.audit({ user, desc: `rollback snapshot '${param.name}' successfully`, ip });
            socket.postEventStatus('snapshot', 18, param.name, true, true);
        } catch (error) {
            snapshot.setRollbackStatus(false);
            handler.error(136, error, param);
            await log.audit({ user, desc: `rollback snapshot '${param.name}' failed`, ip });
            socket.postEventStatus('snapshot', 18, param.name, false, true);
        }
    },
    async getSnapshotSchedule(param) {
        let result = {};
        try {
            let data = await snapshot.getSnapshotSchedule(param);
            result = handler.response(0, data.reverse());
        } catch (error) {
            result = handler.response(141, error, param);
        }
        return result;
    },
    async createSnapshotSchedule(param, user, ip) {
        let result = {};
        try {
            await snapshot.createSnapshotSchedule(param);
            result = handler.response(0, 'create snapshot schedule successfully');
            await log.audit({ user, desc: `create snapshot schedule '${param.name}' successfully`, ip });
        } catch (error) {
            result = handler.response(142, error, param);
            await log.audit({ user, desc: `create snapshot schedule '${param.name}' failed`, ip });
        }
        return result;
    },
    async updateSnapshotSchedule(param, user, ip) {
        let result = {};
        try {
            await snapshot.updateSnapshotSchedule(param);
            result = handler.response(0, 'update snapshot schedule successfully');
            await log.audit({ user, desc: `update snapshot schedule '${param.name}' successfully`, ip });
        } catch (error) {
            result = handler.response(143, error, param);
            await log.audit({ user, desc: `update snapshot schedule '${param.name}' failed`, ip });
        }
        return result;
    },
    async enableSnapshotSchedule(param, user, ip) {
        let result = {};
        try {
            await snapshot.enableSnapshotSchedule(param);
            result = handler.response(0, 'enable snapshot schedule successfully');
            await log.audit({ user, desc: `enable snapshot schedule '${param.name}' successfully`, ip });
        } catch (error) {
            result = handler.response(144, error, param);
            await log.audit({ user, desc: `enable snapshot schedule '${param.name}' failed`, ip });
        }
        return result;
    },
    async disableSnapshotSchedule(param, user, ip) {
        let result = {};
        try {
            await snapshot.disableSnapshotSchedule(param);
            result = handler.response(0, 'disable snapshot schedule successfully');
            await log.audit({ user, desc: `disable snapshot schedule '${param.name}' successfully`, ip });
        } catch (error) {
            result = handler.response(145, error, param);
            await log.audit({ user, desc: `disable snapshot schedule '${param.name}' failed`, ip });
        }
        return result;
    },
    async deleteSnapshotSchedule(param, user, ip) {
        let result = {};
        try {
            await snapshot.deleteSnapshotSchedule(param);
            result = handler.response(0, 'delete snapshot schedule successfully');
            await log.audit({ user, desc: `delete snapshot schedule '${param.name}' successfully`, ip });
        } catch (error) {
            result = handler.response(146, error, param);
            await log.audit({ user, desc: `delete snapshot schedule '${param.name}' failed`, ip });
        }
        return result;
    },
    async batchDeleteSnapshotSchedule(param, user, ip) {
        let result = {};
        try {
            await snapshot.batchDeleteSnapshotSchedule(param);
            result = handler.response(0, 'batch delete snapshot schedule successfully');
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshot schedules '${String(handler.bypass(param.names))}' successfully`, ip });
        } catch (error) {
            result = handler.response(147, error, param);
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshot schedules '${String(handler.bypass(param.names))}' failed`, ip });
        }
        return result;
    },
    async getNasExport(param) {
        let result = {};
        try {
            let data = await database.getNasExport(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(151, error, param);
        }
        return result;
    },
    async createNasExport(param, user, ip) {
        let { path, protocol, description } = param;
        protocol = protocol.toUpperCase();
        let result = {};
        try {
            await database.addNasExport({ path, protocol, description });
            result = handler.response(0, 'create nas export successfully');
            await log.audit({ user, desc: `create nas export '${protocol + '@' + path}' successfully`, ip });
        } catch (error) {
            result = handler.response(152, error, param);
            await log.audit({ user, desc: `create nas export '${protocol + '@' + path}' failed`, ip });
        }
        return result;
    },
    async updateNasExport(param, user, ip) {
        let query = { path: param.path, protocol: param.protocol };
        let result = {};
        try {
            await database.updateNasExport(query, param);
            result = handler.response(0, 'update nas export successfully');
            await log.audit({ user, desc: `update nas export '${param.protocol + '@' + param.path}' successfully`, ip });
        } catch (error) {
            result = handler.response(153, error, param);
            await log.audit({ user, desc: `update nas export '${param.protocol + '@' + param.path}' failed`, ip });
        }
        return result;
    },
    async deleteNasExport(param, user, ip) {
        let result = {};
        try {
            await database.deleteNasExport(param);
            result = handler.response(0, 'delete nas export successfully');
            await log.audit({ user, desc: `delete nas export '${param.protocol + '@' + param.path}' successfully`, ip });
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `delete nas export '${param.protocol + '@' + param.path}' failed`, ip });
        }
        return result;
    },
    async getEventLog(param) {
        let result = {};
        try {
            let data = await database.getEventLog(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(161, error, param);
        }
        return result;
    },
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
            result = handler.response(163, error, param);
        }
        return result;
    },
    async getAuditLog(param) {
        let result = {};
        try {
            let data = await database.getAuditLog(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(164, error, param);
        }
        return result;
    },
    async getEntryInfo(param) {
        let result = {};
        try {
            let res = await afterMe.getEntryInfo(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(171, res.message, param);
            }
        } catch (error) {
            result = handler.response(171, error, param);
        }
        return result;
    },
    async getFiles(param) {
        let result = {};
        try {
            let res = await afterMe.getFiles(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(172, res.message, param);
            }
        } catch (error) {
            result = handler.response(172, error, param);
        }
        return result;
    },
    async setPattern(param, user, ip) {
        let result = {};
        try {
            let res = await afterMe.setPattern(param);
            if (!res.errorId) {
                result = handler.response(0, 'set pattern successfully');
                await log.audit({ user, desc: `set '${param.dirPath}' pattern successfully`, ip });
            } else {
                result = handler.response(173, res.message, param);
                await log.audit({ user, desc: `set '${param.dirPath}' pattern failed`, ip });
            }
        } catch (error) {
            result = handler.response(173, error, param);
            await log.audit({ user, desc: `set '${param.dirPath}' pattern failed`, ip });
        }
        return result;
    }
};
module.exports = model;