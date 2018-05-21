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
    async createUser(param, user, ip) {
        let result = {};
        try {
            await database.addUser(param)
            result = handler.response(0, 'create user successfully');
            await log.audit({ user, desc: `create user '${param.username}' successfully`, ip });
        } catch (error) {
            result = handler.response(53, error, param);
            await log.audit({ user, desc: `create user '${param.username}' failed`, ip });
        }
        return result;
    },
    async updateUser(param, user, ip) {
        let query = { username: param.username };
        let result = {};
        try {
            await database.updateUser(query, param);
            result = handler.response(0, 'update user successfully');
            await log.audit({ user, desc: `update user '${param.username}' successfully`, ip });
        } catch (error) {
            result = handler.response(54, error, param);
            await log.audit({ user, desc: `update user '${param.username}' failed`, ip });
        }
        return result;
    },
    async deleteUser(param, user, ip) {
        let result = {};
        try {
            await database.deleteUser(param);
            result = handler.response(0, 'delete user successfully');
            await log.audit({ user, desc: `delete user '${param.username}' successfully`, ip });
        } catch (error) {
            result = handler.response(55, error, param);
            await log.audit({ user, desc: `delete user '${param.username}' failed`, ip });
        }
        return result;
    },
    async testMail(param, user, ip) {
        let result = {};
        try {
            await email.sendMail(param);
            result = handler.response(0, 'test mail successfully');
            await log.audit({ user, desc: `test SMTP server '${param.host}' successfully`, ip });
        } catch (error) {
            result = handler.response(61, error, param);
            await log.audit({ user, desc: `test SMTP server '${param.host}' failed`, ip });
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
            let { errorId, message } = await snapshot.updateSnapshotSetting(param);
            if (!errorId) {
                result = handler.response(0, 'update snapshot setting successfully');
                await log.audit({ user, desc: `update snapshot setting successfully`, ip });
            } else {
                result = handler.response(122, message, param);
                await log.audit({ user, desc: `update snapshot setting failed`, ip });
            }
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
            let result = await snapshot.deleteSnapshot(param);
            await log.audit({ user, desc: `delete snapshot '${param.name}' ${result ? 'successfully' : 'failed'}`, ip });
        } catch (error) {
            handler.error(134, error, param);
            await log.audit({ user, desc: `delete snapshot '${param.name}' failed`, ip });
            socket.postEventStatus('snapshot', 14, param.name, false, true);
        }
    },
    async batchDeleteSnapshot(param, user, ip) {
        try {
            let result = await snapshot.batchDeleteSnapshot(param);
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshot(s) '${String(handler.bypass(param.names))}' ${result ? 'successfully' : 'failed'}`, ip });
        } catch (error) {
            handler.error(135, error, param);
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshot(s) '${String(handler.bypass(param.names))}' failed`, ip });
            socket.postEventStatus('snapshot', 16, { total: param.names.length }, false, true);
        }
    },
    async rollbackSnapshot(param, user, ip) {
        try {
            process.send('rollback start');
            socket.postEventStatus('snapshot', 17, param.name, true, true);
            let result = await snapshot.rollbackSnapshot(param);
            process.send('rollback end');
            await log.audit({ user, desc: `rollback snapshot '${param.name}' ${result ? 'successfully' : 'failed'}`, ip });
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
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshot schedule(s) '${String(handler.bypass(param.names))}' successfully`, ip });
        } catch (error) {
            result = handler.response(147, error, param);
            await log.audit({ user, desc: `batch delete ${param.names.length} snapshot schedule(s) '${String(handler.bypass(param.names))}' failed`, ip });
        }
        return result;
    },
    async getCIFSShare(param) {
        let result = {};
        try {
            let data = await database.getCIFSShare(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(151, error, param);
        }
        return result;
    },
    async createCIFSShare(param, user, ip) {
        let { path, name, description, oplock, notify, offlineCacheMode, userOrGroupList } = param;
        let result = {};
        try {
            await database.addCIFSShare({ path, name, description, oplock, notify, offlineCacheMode, userOrGroupList });
            result = handler.response(0, 'create CIFS share successfully');
            await log.audit({ user, desc: `create CIFS share '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(152, error, param);
            await log.audit({ user, desc: `create CIFS share '${name}' failed`, ip });
        }
        return result;
    },
    async updateCIFSShare(param, user, ip) {
        let { name, description, oplock, notify, offlineCacheMode } = param;
        let result = {};
        try {
            await database.updateCIFSShare({ name }, { description, oplock, notify, offlineCacheMode });
            result = handler.response(0, 'update CIFS share successfully');
            await log.audit({ user, desc: `update CIFS share '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(153, error, param);
            await log.audit({ user, desc: `update CIFS share '${name}' failed`, ip });
        }
        return result;
    },
    async deleteCIFSShare(param, user, ip) {
        let { name } = param;
        let result = {};
        try {
            await database.deleteCIFSShare({ name });
            result = handler.response(0, 'delete CIFS share successfully');
            await log.audit({ user, desc: `delete CIFS share '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `delete CIFS share '${name}' failed`, ip });
        }
        return result;
    },
    async batchDeleteCIFSShare(param, user, ip) {
        let { names } = param;
        let result = {};
        try {
            for (let name of names) {
                await database.deleteCIFSShare({ name });
            }
            result = handler.response(0, 'batch delete CIFS share successfully');
            await log.audit({ user, desc: `batch delete ${names.length} CIFS share(s) '${String(handler.bypass(names))}' successfully`, ip });
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `batch delete ${names.length} CIFS share(s) '${String(handler.bypass(names))}' failed`, ip });
        }
        return result;
    },
    async getUserOrGroupFromCIFSShare(param) {
        let result = {};
        try {
            let data = await database.getUserOrGroupFromCIFSShare(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(151, error, param);
        }
        return result;
    },
    async addUserOrGroupToCIFSShare(param, user, ip) {
        let { items, shareName } = param;
        let names = items.map(item => (item.name));
        let result = {};
        try {
            await database.addUserOrGroupToCIFSShare(param);
            result = handler.response(0, 'add user or group to CIFS share successfully');
            await log.audit({ user, desc: `add ${names.length} user${items[0].type === 'localAuthenticationUser' ? '(s)' : ' group(s)'} '${String(handler.bypass(names))}' to CIFS share '${shareName}' successfully`, ip });
        } catch (error) {
            result = handler.response(152, error, param);
            await log.audit({ user, desc: `add ${names.length} user${items[0].type === 'localAuthenticationUser' ? '(s)' : ' group(s)'} '${String(handler.bypass(names))}' to CIFS share '${shareName}' failed`, ip });
        }
        return result;
    },
    async updateUserOrGroupInCIFSShare(param, user, ip) {
        let { name, type, shareName } = param;
        let result = {};
        try {
            await database.updateUserOrGroupInCIFSShare(param);
            result = handler.response(0, 'update user or group in CIFS share successfully');
            await log.audit({ user, desc: `update user${type === 'localAuthenticationUser' ? '' : ' group'} '${name}' in CIFS share '${shareName}' successfully`, ip });
        } catch (error) {
            result = handler.response(153, error, param);
            await log.audit({ user, desc: `update user${type === 'localAuthenticationUser' ? '' : ' group'} '${name}' in CIFS share '${shareName}' failed`, ip });
        }
        return result;
    },
    async removeUserOrGroupFromCIFSShare(param, user, ip) {
        let { name, type, shareName } = param;
        let result = {};
        try {
            await database.removeUserOrGroupFromCIFSShare(param);
            result = handler.response(0, 'remove user or group from CIFS share successfully');
            await log.audit({ user, desc: `remove user${type === 'localAuthenticationUser' ? '' : ' group'} '${name}' from CIFS share '${shareName}' successfully`, ip });
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `remove user${type === 'localAuthenticationUser' ? '' : ' group'} '${name}' from CIFS share '${shareName}' failed`, ip });
        }
        return result;
    },
    async getNFSShare(param) {
        let result = {};
        try {
            let data = await database.getNFSShare(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(151, error, param);
        }
        return result;
    },
    async createNFSShare(param, user, ip) {
        let { path, description, clientList } = param;
        let result = {};
        try {
            await database.addNFSShare({ path, description, clientList });
            result = handler.response(0, 'create NFS share successfully');
            await log.audit({ user, desc: `create NFS share '${path}' successfully`, ip });
        } catch (error) {
            result = handler.response(152, error, param);
            await log.audit({ user, desc: `create NFS share '${path}' failed`, ip });
        }
        return result;
    },
    async updateNFSShare(param, user, ip) {
        let { path, description, clientList } = param;
        let result = {};
        try {
            await database.updateNFSShare({ path }, { description, clientList });
            result = handler.response(0, 'update NFS share successfully');
            await log.audit({ user, desc: `update NFS share '${path}' successfully`, ip });
        } catch (error) {
            result = handler.response(153, error, param);
            await log.audit({ user, desc: `update NFS share '${path}' failed`, ip });
        }
        return result;
    },
    async deleteNFSShare(param, user, ip) {
        let { path } = param;
        let result = {};
        try {
            await database.deleteNFSShare({ path });
            result = handler.response(0, 'delete NFS share successfully');
            await log.audit({ user, desc: `delete NFS share '${path}' successfully`, ip });
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `delete NFS share '${path}' failed`, ip });
        }
        return result;
    },
    async batchDeleteNFSShare(param, user, ip) {
        let { paths } = param;
        let result = {};
        try {
            for (let path of paths) {
                await database.deleteNFSShare({ path });
            }
            result = handler.response(0, 'batch delete NFS share successfully');
            await log.audit({ user, desc: `batch delete ${paths.length} NFS share(s) '${String(handler.bypass(paths))}' successfully`, ip });
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `batch delete ${paths.length} NFS share(s) '${String(handler.bypass(paths))}' failed`, ip });
        }
        return result;
    },
    async getClientInNFSShare(param) {
        let result = {};
        try {
            let data = await database.getClientInNFSShare(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(151, error, param);
        }
        return result;
    },
    async createClientInNFSShare(param, user, ip) {
        let { ips, path } = param;
        let result = {};
        try {
            let data = database.addClientInNFSShare(param);
            result = handler.response(0, 'add NFS share client successfully');
            await log.audit({ user, desc: `add ${ips.split(';').length} client(s) '${String(handler.bypass(ips.split(';')))}' to NFS share '${path}' successfully`, ip });
        } catch (error) {
            result = handler.response(152, error, param);
            await log.audit({ user, desc: `add ${ips.split(';').length} client(s) '${String(handler.bypass(ips.split(';')))}' to NFS share '${path}' failed`, ip });
        }
        return result;
    },
    async updateClientInNFSShare(param, user, ip) {
        let { path } = param;
        let result = {};
        try {
            await database.updateClientInNFSShare(param);
            result = handler.response(0, 'update NFS share client successfully');
            await log.audit({ user, desc: `update client '${param.ip}' in NFS share '${path}' successfully`, ip });
        } catch (error) {
            result = handler.response(153, error, param);
            await log.audit({ user, desc: `update client '${param.ip}' in NFS share '${path}' failed`, ip });
        }
        return result;
    },
    async deleteClientInNFSShare(param, user, ip) {
        let { path } = param;
        let result = {};
        try {
            await database.deleteClientInNFSShare(param);
            result = handler.response(0, 'remove NFS share client successfully');
            await log.audit({ user, desc: `remove client '${param.ip}' from NFS share '${path}' successfully`, ip });
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `remove client '${param.ip}' from NFS share '${path}' failed`, ip });
        }
        return result;
    },
    async getLocalAuthUserGroup(param) {
        let result = {};
        try {
            let data = await database.getLocalAuthUserGroup(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(52, error, param);
        }
        return result;
    },
    async createLocalAuthUserGroup(param, user, ip) {
        let { name, description } = param;
        let result = {};
        try {
            await database.addLocalAuthUserGroup({ name, description });
            result = handler.response(0, 'create local authentication user group successfully');
            await log.audit({ user, desc: `create local authentication user group '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(53, error, param);
            await log.audit({ user, desc: `create local authentication user group '${name}' failed`, ip });
        }
        return result;
    },
    async updateLocalAuthUserGroup(param, user, ip) {
        let { name, description } = param;
        let result = {};
        try {
            await database.updateLocalAuthUserGroup({ name }, { description });
            result = handler.response(0, 'update local authentication user group successfully');
            await log.audit({ user, desc: `update local authentication user group '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(54, error, param);
            await log.audit({ user, desc: `update local authentication user group '${name}' failed`, ip });
        }
        return result;
    },
    async deleteLocalAuthUserGroup(param, user, ip) {
        let { name } = param;
        let result = {};
        try {
            await database.deleteLocalAuthUserGroup({ name });
            result = handler.response(0, 'delete local authentication user group successfully');
            await log.audit({ user, desc: `delete local authentication user group '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(55, error, param);
            await log.audit({ user, desc: `delete local authentication user group '${name}' failed`, ip });
        }
        return result;
    },
    async getLocalAuthUserFromGroup(param) {
        let result = {};
        try {
            let data = await database.getLocalAuthUserFromGroup(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(52, error, param);
        }
        return result;
    },
    async addLocalAuthUserToGroup(param, user, ip) {
        let { names, groupName } = param;
        let result = {};
        try {
            await database.addLocalAuthUserToGroup(param);
            result = handler.response(0, 'add local authentication user to user group successfully');
            await log.audit({ user, desc: `add ${names.length} local authentication user(s) '${String(handler.bypass(names))}' to local authentication user group '${groupName}' successfully`, ip });
        } catch (error) {
            result = handler.response(53, error, param);
            await log.audit({ user, desc: `add ${names.length} local authentication user(s) '${String(handler.bypass(names))}' to local authentication user group '${groupName}' failed`, ip });
        }
        return result;
    },
    async removeLocalAuthUserFromGroup(param, user, ip) {
        let { name, groupName } = param;
        let result = {};
        try {
            await database.removeLocalAuthUserFromGroup(param);
            result = handler.response(0, 'remove local authentication user from user group successfully');
            await log.audit({ user, desc: `remove local authentication user '${name}' from local authentication user group '${groupName}' successfully`, ip });
        } catch (error) {
            result = handler.response(55, error, param);
            await log.audit({ user, desc: `remove local authentication user '${name}' from local authentication user group '${groupName}'failed`, ip });
        }
        return result;
    },
    async getLocalAuthUser(param) {
        let result = {};
        try {
            let data = await database.getLocalAuthUser(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(52, error, param);
        }
        return result;
    },
    async createLocalAuthUser(param, user, ip) {
        let { name, password, primaryGroup, secondaryGroup = [], description } = param;
        let result = {};
        try {
            await database.addLocalAuthUser({ name, password, primaryGroup, secondaryGroup, description });
            result = handler.response(0, 'create local authentication user successfully');
            await log.audit({ user, desc: `create local authentication user '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(53, error, param);
            await log.audit({ user, desc: `create local authentication user '${name}' failed`, ip });
        }
        return result;
    },
    async updateLocalAuthUser(param, user, ip) {
        let { name, changePassword, password, primaryGroup, description } = param;
        let result = {};
        try {
            changePassword ? await database.updateLocalAuthUser({ name }, { password, primaryGroup, description }) : await database.updateLocalAuthUser({ name }, { primaryGroup, description });
            result = handler.response(0, 'update local authentication user successfully');
            await log.audit({ user, desc: `update local authentication user '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(54, error, param);
            await log.audit({ user, desc: `update local authentication user '${name}' failed`, ip });
        }
        return result;
    },
    async deleteLocalAuthUser(param, user, ip) {
        let { name } = param;
        let result = {};
        try {
            await database.deleteLocalAuthUser({ name });
            result = handler.response(0, 'delete local authentication user successfully');
            await log.audit({ user, desc: `delete local authentication user '${name}' successfully`, ip });
        } catch (error) {
            result = handler.response(55, error, param);
            await log.audit({ user, desc: `delete local authentication user '${name}' failed`, ip });
        }
        return result;
    },
    async batchDeleteLocalAuthUser(param, user, ip) {
        let { names } = param;
        let result = {};
        try {
            for (let name of names) {
                await database.deleteLocalAuthUser({ name });
            }
            result = handler.response(0, 'batch delete local authentication user successfully');
            await log.audit({ user, desc: `batch delete ${names.length} local authentication user(s) '${String(handler.bypass(names))}' successfully`, ip });
        } catch (error) {
            result = handler.response(55, error, param);
            await log.audit({ user, desc: `batch delete ${names.length} local authentication user(s) '${String(handler.bypass(names))}' failed`, ip });
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
                await log.audit({ user, desc: `update directory '${param.dirPath}' pattern setting successfully`, ip });
            } else {
                result = handler.response(173, res.message, param);
                await log.audit({ user, desc: `update directory '${param.dirPath}' pattern setting failed`, ip });
            }
        } catch (error) {
            result = handler.response(173, error, param);
            await log.audit({ user, desc: `update directory '${param.dirPath}' pattern setting failed`, ip });
        }
        return result;
    },
    async getClusterStatus(param) {
        let result = {};
        try {
            let data = { status: true, total: 5, normal: 5, abnormal: 0 };
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getTargetRanking(param) {
        let result = {};
        try {
            let data = [
                { targetId: 101, mountPath: '/mnt/target101', node: 'node1', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '90%' } },
                { targetId: 107, mountPath: '/mnt/target107', node: 'node4', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 8, free: 1024 * 1024 * 1024 * 1024 * 2, usage: '80%' } },
                { targetId: 108, mountPath: '/mnt/target108', node: 'node4', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 8, free: 1024 * 1024 * 1024 * 1024 * 2, usage: '80%' } },
                { targetId: 103, mountPath: '/mnt/target103', node: 'node2', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 7, free: 1024 * 1024 * 1024 * 1024 * 3, usage: '70%' } },
                { targetId: 105, mountPath: '/mnt/target105', node: 'node3', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 5, free: 1024 * 1024 * 1024 * 1024 * 5, usage: '50%' } },
                { targetId: 102, mountPath: '/mnt/target102', node: 'node1', service: 'meta', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 3, free: 1024 * 1024 * 1024 * 1024 * 7, usage: '30%' } },
                { targetId: 104, mountPath: '/mnt/target104', node: 'node2', service: 'meta', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 3, free: 1024 * 1024 * 1024 * 1024 * 7, usage: '30%' } },
                { targetId: 106, mountPath: '/mnt/target106', node: 'node3', service: 'meta', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 2, free: 1024 * 1024 * 1024 * 1024 * 8, usage: '20%' } }
            ];
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getClusterThroughput(param) {
        let result = {};
        try {
            let currentTime = Math.floor(new Date().getTime() / 1000) * 1000;
            let list = Array.from({ length: 60 }).fill(0);
            let time = list.map((item, index) => (item + currentTime - index * 15000));
            let throughput = list.map(item => (item + Math.floor(Math.random() * 10000)));
            let data = { value: throughput, time };
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getClusterIops(param) {
        let result = {};
        try {
            let currentTime = Math.floor(new Date().getTime() / 1000) * 1000;
            let list = Array.from({ length: 60 }).fill(0);
            let time = list.map((item, index) => (item + currentTime - index * 15000));
            let iops = list.map(item => (item + Math.floor(Math.random() * 10000)));
            let data = { value: iops, time };
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeList(param) {
        let result = {};
        try {
            let data = [
                { hostname: 'node1', service: ['meta', 'storage'], ip: '192.168.100.18', status: true, cpuUsage: '40%', memoryUsage: '35%', space: { total: 1024 * 1024 * 1024 * 1024 * 20, used: 1024 * 1024 * 1024 * 1024 * 12, free: 1024 * 1024 * 1024 * 1024 * 8, usage: '60%' } },
                { hostname: 'node2', service: ['meta', 'storage'], ip: '192.168.100.19', status: true, cpuUsage: '45%', memoryUsage: '50%', space: { total: 1024 * 1024 * 1024 * 1024 * 20, used: 1024 * 1024 * 1024 * 1024 * 10, free: 1024 * 1024 * 1024 * 1024 * 10, usage: '50%' } },
                { hostname: 'node3', service: ['meta', 'storage'], ip: '192.168.100.20', status: true, cpuUsage: '60%', memoryUsage: '85%', space: { total: 1024 * 1024 * 1024 * 1024 * 20, used: 1024 * 1024 * 1024 * 1024 * 13, free: 1024 * 1024 * 1024 * 1024 * 7, usage: '65%' } },
                { hostname: 'node4', service: ['storage'], ip: '192.168.100.21', status: true, cpuUsage: '30%', memoryUsage: '60%', space: { total: 1024 * 1024 * 1024 * 1024 * 20, used: 1024 * 1024 * 1024 * 1024 * 16, free: 1024 * 1024 * 1024 * 1024 * 4, usage: '80%' } },
                { hostname: 'node5', service: ['mgmt'], ip: '192.168.100.22', status: true, cpuUsage: '20%', memoryUsage: '30%', space: '--' }
            ];
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    }
};
module.exports = model;