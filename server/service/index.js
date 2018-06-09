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
                            process.send('initialize successfully');
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
            result = handler.response(0, 'update snapshot successfully');
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
            let nasServerList = await database.getNasServer();
            let serverIp = nasServerList.filter(server => (handler.checkRoot(path, server.path)))[0].ip;
            let create = await afterMe.createCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ path, name, desc: description, oplock, notify, cacheMode: offlineCacheMode }] } });
            if (!create.errorId) {
                if (userOrGroupList.length) {
                    userOrGroupList = userOrGroupList.map(item => ({ type: item.type, name: item.name, permission: item.permission }));
                    let userList = userOrGroupList.map(item => ({ clientType: item.type, name: item.name, permission: item.permission }));
                    let add = await afterMe.addUserOrGroupToCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ name, userList }] } });
                    if (!add.errorId) {
                        await database.addCIFSShare({ path, name, description, oplock, notify, offlineCacheMode, userOrGroupList });
                    } else {
                        await database.addCIFSShare({ path, name, description, oplock, notify, offlineCacheMode, userOrGroupList: [] });
                    }
                } else {
                    await database.addCIFSShare({ path, name, description, oplock, notify, offlineCacheMode, userOrGroupList: [] });
                }
                result = handler.response(0, 'create CIFS share successfully');
                await log.audit({ user, desc: `create CIFS share '${name}' successfully`, ip });
            } else {
                result = handler.response(152, create.message, param);
                await log.audit({ user, desc: `create CIFS share '${name}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(152, error, param);
            await log.audit({ user, desc: `create CIFS share '${name}' failed`, ip });
        }
        return result;
    },
    async updateCIFSShare(param, user, ip) {
        let { name, path, description, oplock, notify, offlineCacheMode } = param;
        let result = {};
        try {
            let nasServerList = await database.getNasServer();
            let serverIp = nasServerList.filter(server => (handler.checkRoot(path, server.path)))[0].ip;
            let res = await afterMe.updateCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ name, desc: description, oplock, notify, cacheMode: offlineCacheMode }] } });
            if (!res.errorId) {
                await database.updateCIFSShare({ name, path }, { description, oplock, notify, offlineCacheMode });
                result = handler.response(0, 'update CIFS share successfully');
                await log.audit({ user, desc: `update CIFS share '${name}' successfully`, ip });
            } else {
                result = handler.response(153, res.message, param);
                await log.audit({ user, desc: `update CIFS share '${name}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(153, error, param);
            await log.audit({ user, desc: `update CIFS share '${name}' failed`, ip });
        }
        return result;
    },
    async deleteCIFSShare(param, user, ip) {
        let { name, path } = param;
        let result = {};
        try {
            let nasServerList = await database.getNasServer();
            let serverIp = nasServerList.filter(server => (handler.checkRoot(path, server.path)))[0].ip;
            let res = await afterMe.deleteCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ name }] } });
            if (!res.errorId) {
                await database.deleteCIFSShare({ name, path });
                result = handler.response(0, 'delete CIFS share successfully');
                await log.audit({ user, desc: `delete CIFS share '${name}' successfully`, ip });
            } else {
                result = handler.response(154, res.message, param);
                await log.audit({ user, desc: `delete CIFS share '${name}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `delete CIFS share '${name}' failed`, ip });
        }
        return result;
    },
    async batchDeleteCIFSShare(param, user, ip) {
        let { shares } = param;
        let names = shares.map(share => (share.name));
        let result = {};
        try {
            let success = 0;
            let nasServerList = await database.getNasServer();
            for (let share of shares) {
                let { name, path } = share;
                let serverIp = nasServerList.filter(server => (handler.checkRoot(path, server.path)))[0].ip;
                let res = await afterMe.deleteCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ name }] } });
                if (!res.errorId) {
                    await database.deleteCIFSShare({ name });
                    success += 1;
                }
            }
            if (success === shares.length) {
                result = handler.response(0, 'batch delete CIFS share successfully');
                await log.audit({ user, desc: `batch delete ${names.length} CIFS share(s) '${String(handler.bypass(names))}' successfully`, ip });
            } else {
                result = handler.response(154, 'batch delete CIFS share failed', param);
                await log.audit({ user, desc: `batch delete ${names.length} CIFS share(s) '${String(handler.bypass(names))}' failed`, ip });
            }
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
        let { items, shareName, sharePath } = param;
        let names = items.map(item => (item.name));
        let result = {};
        try {
            let success = 0;
            let nasServerList = await database.getNasServer();
            let serverIp = nasServerList.filter(server => (handler.checkRoot(sharePath, server.path)))[0].ip;
            for (let item of items) {
                let { type, name, permission } = item;
                let userList = [{ clientType: type, name, permission }];
                logger.info(userList);
                let res = await afterMe.addUserOrGroupToCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ name: shareName, userList }] } });
                if (!res.errorId) {
                    await database.addUserOrGroupToCIFSShare({ type, name, permission, shareName });
                    success += 1;
                }
                logger.info(res.message);
            }
            if (success === items.length) {
                result = handler.response(0, 'add user or group to CIFS share successfully');
                await log.audit({ user, desc: `add ${names.length} user${items[0].type === 'local_user' ? '(s)' : ' group(s)'} '${String(handler.bypass(names))}' to CIFS share '${shareName}' successfully`, ip });
            } else {
                result = handler.response(152, 'add user or group to CIFS share failed', param);
                await log.audit({ user, desc: `add ${names.length} user${items[0].type === 'local_user' ? '(s)' : ' group(s)'} '${String(handler.bypass(names))}' to CIFS share '${shareName}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(152, error, param);
            await log.audit({ user, desc: `add ${names.length} user${items[0].type === 'local_user' ? '(s)' : ' group(s)'} '${String(handler.bypass(names))}' to CIFS share '${shareName}' failed`, ip });
        }
        return result;
    },
    async updateUserOrGroupInCIFSShare(param, user, ip) {
        let { name, type, permission, shareName, sharePath } = param;
        let result = {};
        try {
            let nasServerList = await database.getNasServer();
            let serverIp = nasServerList.filter(server => (handler.checkRoot(sharePath, server.path)))[0].ip;
            let userList = [{ clientType: type, name, permission }];
            let res = await afterMe.updateUserOrGroupInCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ name: shareName, userList }] } });
            if (!res.errorId) {
                await database.updateUserOrGroupInCIFSShare(param);
                result = handler.response(0, 'update user or group in CIFS share successfully');
                await log.audit({ user, desc: `update user${type === 'local_user' ? '' : ' group'} '${name}' in CIFS share '${shareName}' successfully`, ip });
            } else {
                result = handler.response(153, res.message, param);
                await log.audit({ user, desc: `update user${type === 'local_user' ? '' : ' group'} '${name}' in CIFS share '${shareName}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(153, error, param);
            await log.audit({ user, desc: `update user${type === 'local_user' ? '' : ' group'} '${name}' in CIFS share '${shareName}' failed`, ip });
        }
        return result;
    },
    async removeUserOrGroupFromCIFSShare(param, user, ip) {
        let { name, type, shareName, sharePath } = param;
        let result = {};
        try {
            let nasServerList = await database.getNasServer();
            let serverIp = nasServerList.filter(server => (handler.checkRoot(sharePath, server.path)))[0].ip;
            let userList = [{ clientType: type, name }];
            let res = await afterMe.removeUserOrGroupFromCIFSShare({ clientCifsInfo: { serverIp, cifsShareList: [{ name: shareName, userList }] } });
            if (!res.errorId) {
                await database.removeUserOrGroupFromCIFSShare(param);
                result = handler.response(0, 'remove user or group from CIFS share successfully');
                await log.audit({ user, desc: `remove user${type === 'local_user' ? '' : ' group'} '${name}' from CIFS share '${shareName}' successfully`, ip });
            } else {
                result = handler.response(154, res.message, param);
                await log.audit({ user, desc: `remove user${type === 'local_user' ? '' : ' group'} '${name}' from CIFS share '${shareName}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(154, error, param);
            await log.audit({ user, desc: `remove user${type === 'local_user' ? '' : ' group'} '${name}' from CIFS share '${shareName}' failed`, ip });
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
            let res = await afterMe.addLocalAuthUserGroup({ userInfo: { localGroupList: [{ groupName: name, desc: description }] } });
            if (!res.errorId) {
                await database.addLocalAuthUserGroup({ name, description });
                result = handler.response(0, 'create local authentication user group successfully');
                await log.audit({ user, desc: `create local authentication user group '${name}' successfully`, ip });
            } else {
                result = handler.response(53, res.message, param);
                await log.audit({ user, desc: `create local authentication user group '${name}' failed`, ip });
            }
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
            let res = await afterMe.updateLocalAuthUserGroup({ userInfo: { localGroupList: [{ groupName: name, desc: description }] } });
            if (!res.errorId) {
                await database.updateLocalAuthUserGroup({ name }, { description });
                result = handler.response(0, 'update local authentication user group successfully');
                await log.audit({ user, desc: `update local authentication user group '${name}' successfully`, ip });
            } else {
                result = handler.response(54, res.message, param);
                await log.audit({ user, desc: `update local authentication user group '${name}' failed`, ip });
            }
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
            let res = await afterMe.deleteLocalAuthUserGroup({ userInfo: { localGroupList: [{ groupName: name }] } });
            if (!res.errorId) {
                await database.deleteLocalAuthUserGroup({ name });
                result = handler.response(0, 'delete local authentication user group successfully');
                await log.audit({ user, desc: `delete local authentication user group '${name}' successfully`, ip });
            } else {
                result = handler.response(55, res.message, param);
                await log.audit({ user, desc: `delete local authentication user group '${name}' failed`, ip });
            }
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
            let success = 0;
            for (let name of names) {
                let res = await afterMe.addLocalAuthUserToGroup({ userInfo: { localUserList: [{ userName: name, secondaryGroup: [groupName] }] } });
                if (!res.errorId) {
                    await database.addLocalAuthUserToGroup({ name, groupName });
                    success += 1;
                }
            }
            if (success === names.length) {
                result = handler.response(0, 'add local authentication user to user group successfully');
                await log.audit({ user, desc: `add ${names.length} local authentication user(s) '${String(handler.bypass(names))}' to local authentication user group '${groupName}' successfully`, ip });
            } else {
                result = handler.response(53, 'add local authentication user to user group failed', param);
                await log.audit({ user, desc: `add ${names.length} local authentication user(s) '${String(handler.bypass(names))}' to local authentication user group '${groupName}' failed`, ip });
            }
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
            let res = await afterMe.removeLocalAuthUserFromGroup({ userInfo: { localUserList: [{ userName: name, secondaryGroup: [groupName] }] } });
            if (!res.errorId) {
                await database.removeLocalAuthUserFromGroup(param);
                result = handler.response(0, 'remove local authentication user from user group successfully');
                await log.audit({ user, desc: `remove local authentication user '${name}' from local authentication user group '${groupName}' successfully`, ip });
            } else {
                result = handler.response(55, res.message, param);
                await log.audit({ user, desc: `remove local authentication user '${name}' from local authentication user group '${groupName}'failed`, ip });
            }
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
            let res = await afterMe.addLocalAuthUser({ userInfo: { localUserList: [{ userName: name, passWord: password, desc: description, primaryGroup, secondaryGroup }] } });
            if (!res.errorId) {
                await database.addLocalAuthUser({ name, password, primaryGroup, secondaryGroup, description });
                result = handler.response(0, 'create local authentication user successfully');
                await log.audit({ user, desc: `create local authentication user '${name}' successfully`, ip });
            } else {
                result = handler.response(53, res.message, param);
                await log.audit({ user, desc: `create local authentication user '${name}' failed`, ip });
            }
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
            let res = await afterMe.updateLocalAuthUser({ userInfo: { localUserList: [{ userName: name, passWord: password, desc: description, primaryGroup }] } });
            if (!res.errorId) {
                changePassword ? await database.updateLocalAuthUser({ name }, { password, primaryGroup, description }) : await database.updateLocalAuthUser({ name }, { primaryGroup, description });
                result = handler.response(0, 'update local authentication user successfully');
                await log.audit({ user, desc: `update local authentication user '${name}' successfully`, ip });
            } else {
                result = handler.response(54, res.message, param);
                await log.audit({ user, desc: `update local authentication user '${name}' failed`, ip });
            }
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
            let res = await afterMe.deleteLocalAuthUser({ userInfo: { localUserList: [{ userName: name }] } });
            if (!res.errorId) {
                await database.deleteLocalAuthUser({ name });
                result = handler.response(0, 'delete local authentication user successfully');
                await log.audit({ user, desc: `delete local authentication user '${name}' successfully`, ip });
            } else {
                result = handler.response(55, res.message, param);
                await log.audit({ user, desc: `delete local authentication user '${name}' failed`, ip });
            }
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
            let sucess = 0;
            for (let name of names) {
                let res = await afterMe.deleteLocalAuthUser({ userInfo: { localUserList: [{ userName: name }] } });
                if (!res.errorId) {
                    await database.deleteLocalAuthUser({ name });
                    sucess += 1;
                }
            }
            if (sucess === names.length) {
                result = handler.response(0, 'batch delete local authentication user successfully');
                await log.audit({ user, desc: `batch delete ${names.length} local authentication user(s) '${String(handler.bypass(names))}' successfully`, ip });
            } else {
                result = handler.response(55, 'batch delete local authentication user failed', param);
                await log.audit({ user, desc: `batch delete ${names.length} local authentication user(s) '${String(handler.bypass(names))}' failed`, ip });
            }
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
    async getClusterInfo(param) {
        let result = {};
        try {
            let version = await afterMe.getVersion(param);
            version = version.errorId ? '1.0.0' : version.data;
            let node = await afterMe.getNodeList(param);
            let clusterStatus = {};
            if (node.errorId) {
                clusterStatus = { status: false, total: 0, normal: 0, abnormal: 0 };
            } else {
                let total = node.data.length;
                let normal = node.data.filter(i => (i.status)).length;
                let status = total === normal ? true : false;
                clusterStatus = { status, total, normal, abnormal: total - normal };
            }
            let space = await afterMe.getStorageDiskSpace(param);
            space = version.errorId ? { total: 0, used: 0, free: 0, usage: '0%' } : { total: space.data.total, used: space.data.used, free: space.data.free, usage: `${(space.data.used / space.data.total * 100).toFixed(2)}%` };
            let data = { clusterStatus, clusterCapacity: space, version };
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getClusterTarget(param) {
        let { ranking } = param;
        let result = {};
        try {
            let res = await afterMe.getClusterTarget(param);
            if (!res.errorId) {
                if (ranking) {
                    res.data = res.data.sort((prev, next) => (prev.space.usage < next.space.usage));
                } else {
                    res.data = res.data.sort((prev, next) => (prev.targetId > next.targetId));
                }
                result = handler.response(0, res.data);
            } else {
                result = handler.response(173, res.message, param);
            }
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getClusterThroughput(param) {
        let result = {};
        try {
            let data = await database.getClusterThrought(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getClusterIops(param) {
        let result = {};
        try {
            let data = await database.getClusterIops(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeList(param) {
        let result = {};
        try {
            let res = await afterMe.getNodeList(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(173, res.message, param);
            }
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeService(param) {
        let result = {};
        try {
            let res = await afterMe.getNodeService(param);
            if (!res.errorId) {
                result = handler.response(0, { metadata: res.data.meta, storage: res.data.storage });
            } else {
                result = handler.response(173, res.message, param);
            }
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeCpu(param) {
        let result = {};
        try {
            let data = await database.getNodeCpu(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeMemory(param) {
        let result = {};
        try {
            let data = await database.getNodeMemory(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeIops(param) {
        let result = {};
        try {
            let data = await database.getNodeIops(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeThroughput(param) {
        let result = {};
        try {
            let data = await database.getNodeThroughput(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNodeTarget(param) {
        let result = {};
        try {
            let res = await afterMe.getNodeTarget(param);
            if (!res.errorId) {
                result = handler.response(0, res.data);
            } else {
                result = handler.response(173, res.message, param);
            }
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async getNasServer(param) {
        let result = {};
        try {
            let data = await database.getNasServer(param);
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async createNasServer(param, user, ip) {
        let { ip: server, path, description } = param;
        let result = {};
        try {
            let res = await afterMe.createNasServer({ nasServerList: [{ clientIp: server, nasRoot: path }] });
            if (!res.errorId) {
                await database.addNasServer({ ip: server, path, description });
                result = handler.response(0, 'create NAS server successfully');
                await log.audit({ user, desc: `create NAS server '${server}' successfully`, ip });
            } else {
                result = handler.response(173, res.message, param);
                await log.audit({ user, desc: `create NAS server '${server}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(173, error, param);
            await log.audit({ user, desc: `create NAS server '${server}' failed`, ip });
        }
        return result;
    },
    async updateNasServer(param, user, ip) {
        let { ip: server, path, description } = param;
        let result = {};
        try {
            await database.updateNasServer({ ip: server, path }, { description });
            result = handler.response(0, 'update NAS server successfully');
            await log.audit({ user, desc: `update NAS server '${server}' successfully`, ip });
        } catch (error) {
            result = handler.response(173, error, param);
            await log.audit({ user, desc: `update NAS server '${server}' failed`, ip });
        }
        return result;
    },
    async getInitParam(param) {
        let result = {};
        try {
            let data = await database.getSetting({ key: config.setting.initParam });
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async createTarget(param, user, ip) {
        let { ip: server } = param;
        let result = {};
        try {
            let res = await afterMe.createTarget(param);
            if (!res.errorId) {
                result = handler.response(0, data);
                await log.audit({ user, desc: `create target in '${server}' successfully`, ip });
            } else {
                result = handler.response(173, error, param);
                await log.audit({ user, desc: `create target in '${server}' failed`, ip });
            }
        } catch (error) {
            result = handler.response(173, error, param);
            await log.audit({ user, desc: `create target in '${server}' failed`, ip });
        }
        return result;
    },
    async getBuddyGroup(param) {
        let result = {};
        try {
            let buddyGroup = Object.assign(await afterMe.getBuddyGroup(param)).data;
            let data = buddyGroup.sort((prev, next) => (prev.groupId > next.groupId));
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    },
    async createBuddyGroup(param, user, ip) {
        let { buddyGroups } = param;
        let result = {};
        try {
            let res = await afterMe.createBuddyGroup(buddyGroups);
            if (!res.errorId) {
                result = handler.response(0, data);
                await log.audit({ user, desc: `create ${buddyGroups.length} buddy group(s) successfully`, ip });
            } else {
                result = handler.response(173, error, param);
                await log.audit({ user, desc: `create ${buddyGroups.length} buddy group(s) failed`, ip });
            }
        } catch (error) {
            result = handler.response(173, error, param);
            await log.audit({ user, desc: `create ${buddyGroups.length} buddy group(s) failed`, ip });
        }
        return result;
    },
    async getClient(param) {
        let result = {};
        try {
            let clientList = Object.assign(await afterMe.getClient(param)).data || [];
            let nasServerList = await database.getNasServer();
            let nasServerIpList = nasServerList.map(server => (server.ip));
            let data = clientList.map(client => ({ hostname: client.name, ip: client.ip, isUsed: nasServerIpList.includes(client.ip) }));
            result = handler.response(0, data);
        } catch (error) {
            result = handler.response(173, error, param);
        }
        return result;
    }
};
module.exports = model;