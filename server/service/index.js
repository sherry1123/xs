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
const promise = require('../module/promise');
const request = require('../module/request');
const handler = require('../module/handler');
const model = {
    async checkClusterEnv(param) {
        let { ipList } = param;
        let result = {};
        try {
            result = handler.response(0, 'check cluster enviroment');
        } catch (error) {
            result = handler.response(6, error, param);
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
                result = handler.response(38, res.message, param);
            }
        } catch (error) {
            result = handler.response(38, error, param);
        }
        return result;
    },
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
                            await init.restartServer(nodelist);
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
                        await init.restartServer(nodelist);
                    }
                }
            }, 1000);
        } catch (error) {
            handler.error(8, error, mode);
        }
    },
    async receiveEvent(param) {
        let { channel, code, target, info: { user, ip } } = param;
        switch (code) {
            case 5:
                for (let snapshot of target) {
                    await database.deleteSnapshot({ name: snapshot.name });
                }
                await log.audit({ user, desc: 'delete snapshots successfully', ip });
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
                await log.audit({ user, desc: `delete snapshots failed`, ip });
                await log.event({ desc: `delete snapshots failed. total: ${target.length}, success: ${success}, failed: ${target.length - success}`, level: 2, source: 'orcafs' });
                socket.postEventStatus({ channel, code, target: { total: target.length, success, failed: target.length - success }, result: false });
                break;
        }
    },
    async login(param, ip) {
        let { username, password } = param;
        let result = {};
        try {
            let data = await database.login({ username, password });
            if (data.username) {
                await log.audit({ user: username, desc: 'login successfully', ip });
                result = handler.response(0, data);
            } else {
                result = handler.response(9, 'username or password error', param);
            }
        } catch (error) {
            result = handler.response(9, error, param);
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
            result = handler.response(10, error, param);
        }
        return result;
    },
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
    async updateUser(param, ip) {
        let query = { username: param.username };
        let result = {};
        try {
            await database.updateUser(query, param);
            result = handler.response(0, 'change password successfully');
            await log.audit({ user: param.username, desc: 'change password successfully', ip });
        } catch (error) {
            result = handler.response(12, error, param);
        }
        return result;
    },
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
    async getMetaNodeStatus(param) {
        let result = {};
        try {
            let res = await afterMe.getMetaNodeStatus(param);
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
    async getStorageNodeStatus(param) {
        let result = {};
        try {
            let res = await afterMe.getStorageNodeStatus(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(65, res.message, param);
            }
        } catch (error) {
            result = handler.response(65, error, param);
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
                result = handler.response(65, res.message, param);
            }
        } catch (error) {
            result = handler.response(65, error, param);
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
                result = handler.response(65, res.message, param);
            }
        } catch (error) {
            result = handler.response(65, error, param);
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
            let res = await afterMe.getUserStorageStats(param);
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
            let res = await afterMe.getClientMetaStats(param);
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
            let res = await afterMe.getClientStorageStats(param);
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
            await log.audit({ user, desc: 'update snapshot setting successfully', ip });
        } catch (error) {
            result = handler.response(56, error, param);
            await log.audit({ user, desc: `update snapshot setting failed`, ip });
            await log.event({ desc: `update snapshot setting failed. reason: ${error}` });
        }
        return result;
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
                await log.audit({ user, desc: 'create snapshot successfully', ip });
            } else {
                result = handler.response(43, 'the number of snapshots has reached the limit', param);
                await log.audit({ user, desc: `create snapshot failed`, ip });
                await log.event({ desc: 'create snapshot failed. reason: the number of snapshots has reached the limit' });
            }
        } catch (error) {
            result = handler.response(43, error, param);
            await log.audit({ user, desc: `create snapshot failed`, ip });
            await log.event({ desc: `create snapshot failed. reason: ${error}` });
        }
        return result;
    },
    async updateSnapshot(param, user, ip) {
        let result = {};
        try {
            await snapshot.updateSnapshot(param);
            await log.audit({ user, desc: 'update snapshot successfully', ip });
        } catch (error) {
            result = handler.response(43, error, param);
            await log.audit({ user, desc: `update snapshot failed`, ip });
            await log.event({ desc: `update snapshot failed. reason: ${error}` });
        }
        return result;
    },
    async deleteSnapshot(param, user, ip) {
        try {
            await snapshot.deleteSnapshot(param);
            await log.audit({ user, desc: 'delete snapshot successfully', ip });
            socket.postEventStatus({ channel: 'snapshot', code: 1, target: param.name, result: true });
        } catch (error) {
            handler.error(44, error, param);
            await log.audit({ user, desc: `delete snapshot failed`, ip });
            await log.event({ desc: `delete snapshot failed. reason: ${error}` });
            socket.postEventStatus({ channel: 'snapshot', code: 2, target: param.name, result: false });
        }
    },
    async deleteSnapshots(param, user, ip) {
        try {
            await snapshot.deleteSnapshots(param);
            status.sendEvent({ channel: 'snapshot', target: param.names, info: { user, ip } });
            await log.audit({ user, desc: 'start to delete snapshots successfully', ip });
        } catch (error) {
            handler.error(60, error, param);
            await log.audit({ user, desc: `start to delete snapshots failed`, ip });
            await log.event({ desc: `start to delete snapshots failed. reason: ${error}` });
        }
    },
    async rollbackSnapshot(param, user, ip) {
        try {
            process.send('rollback start');
            socket.postEventStatus({ channel: 'snapshot', code: 3, target: param.name, result: true });
            await snapshot.rollbackSnapshot(param);
            process.send('rollback end');
            await log.audit({ user, desc: 'rollback snapshot successfully', ip });
            socket.postEventStatus({ channel: 'snapshot', code: 4, target: param.name, result: true });
        } catch (error) {
            snapshot.setRollbackStatus(false);
            handler.error(45, error, param);
            await log.audit({ user, desc: `rollback snapshot failed`, ip });
            await log.event({ desc: `rollback snapshot failed. reason: ${error}` });
            socket.postEventStatus({ channel: 'snapshot', code: 4, target: param.name, result: false });
        }
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
            await log.audit({ user, desc: 'create snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(51, error, param);
            await log.audit({ user, desc: `create snapshot task failed`, ip });
            await log.event({ desc: `create snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async updateSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.updateSnapshotTask(param);
            result = handler.response(0, 'update snapshot task successfully');
            await log.audit({ user, desc: 'update snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(51, error, param);
            await log.audit({ user, desc: `update snapshot task failed`, ip });
            await log.event({ desc: `update snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async enableSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.enableSnapshotTask(param);
            result = handler.response(0, 'enable snapshot task successfully');
            await log.audit({ user, desc: 'enable snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(52, error, param);
            await log.audit({ user, desc: `enable snapshot task failed`, ip });
            await log.event({ desc: `enable snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async disableSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.disableSnapshotTask(param);
            result = handler.response(0, 'disable snapshot task successfully');
            await log.audit({ user, desc: 'disable snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(53, error, param);
            await log.audit({ user, desc: `disable snapshot task failed`, ip });
            await log.event({ desc: `disable snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async deleteSnapshotTask(param, user, ip) {
        let result = {};
        try {
            await snapshot.deleteSnapshotTask(param);
            result = handler.response(0, 'delete snapshot task successfully');
            await log.audit({ user, desc: 'delete snapshot task successfully', ip });
        } catch (error) {
            result = handler.response(54, error, param);
            await log.audit({ user, desc: `delete snapshot task failed`, ip });
            await log.event({ desc: `delete snapshot task failed. reason: ${error}` });
        }
        return result;
    },
    async deleteSnapshotTasks(param, user, ip) {
        let result = {};
        try {
            await snapshot.deleteSnapshotTasks(param);
            result = handler.response(0, 'delete snapshot tasks successfully');
            await log.audit({ user, desc: 'delete snapshot tasks successfully', ip });
        } catch (error) {
            result = handler.response(54, error, param);
            await log.audit({ user, desc: `delete snapshot tasks failed`, ip });
            await log.event({ desc: `delete snapshot tasks failed. reason: ${error}` });
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
            await log.audit({ user, desc: 'create nas export successfully', ip });
        } catch (error) {
            result = handler.response(58, error, param);
            await log.audit({ user, desc: `create nas export failed`, ip });
            await log.event({ desc: `create nas export failed. reason: ${error}` });
        }
        return result;
    },
    async updateNasExport(param, user, ip) {
        let query = { path: param.path, protocol: param.protocol };
        let result = {};
        try {
            await database.updateNasExport(query, param);
            result = handler.response(0, 'update nas export successfully');
            await log.audit({ user, desc: 'update nas export successfully', ip });
        } catch (error) {
            result = handler.response(62, error, param);
            await log.audit({ user, desc: `update nas export failed`, ip });
            await log.event({ desc: `update nas export failed. reason: ${error}` });
        }
        return result;
    },
    async deleteNasExport(param, user, ip) {
        let result = {};
        try {
            await database.deleteNasExport(param);
            result = handler.response(0, 'delete nas export successfully');
            await log.audit({ user, desc: 'delete nas export successfully', ip });
        } catch (error) {
            result = handler.response(59, error, param);
            await log.audit({ user, desc: `delete nas export failed`, ip });
            await log.event({ desc: `delete nas export failed. reason: ${error}` });
        }
        return result;
    },
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
    async getEntryInfo(param) {
        let result = {};
        try {
            let res = await afterMe.getEntryInfo(param);
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
    async getFiles(param) {
        let result = {};
        try {
            let res = await afterMe.getFiles(param);
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
    async setPattern(param, user, ip) {
        let result = {};
        try {
            let res = await afterMe.setPattern(param);
            if (!res.errorId) {
                result = handler.response(0, 'set pattern successfully');
                await log.audit({ user, desc: 'set pattern successfully', ip });
            } else {
                result = handler.response(41, res.message, param);
                await log.audit({ user, desc: `set pattern failed`, ip });
                await log.event({ desc: `set pattern failed, reason: ${res.message}` });
            }
        } catch (error) {
            result = handler.response(41, error, param);
            await log.audit({ user, desc: `set pattern failed`, ip });
            await log.event({ desc: `set pattern failed. reason: ${error}` });
        }
        return result;
    },
    async getStorageNodesThroughput(param) {
        let result = {};
        try {
            let data = await afterMe.getStorageNodesOverview(param);
            data = { diskPerfRead: data.diskPerfRead, diskPerfWrite: data.diskPerfWrite };
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(31, error, param);
        }
        return result;
    },
    async getStorageNodeThroughput(param) {
        let result = {};
        try {
            let data = await afterMe.getStorageNode(param);
            data = { diskPerfRead: data.diskPerfRead, diskPerfWrite: data.diskPerfWrite };
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(33, error, param);
        }
        return result;
    }
};
module.exports = model;