const status = require('./status');
const config = require('../config');
const afterMe = require('./afterMe');
const database = require('./database');
const socket = require('../module/socket');
const promise = require('../module/promise');
const handler = require('../module/handler');
const request = require('../module/request');
let rollbacking = false;
const model = {
    getRollbackStatus() {
        return rollbacking;
    },
    setRollbackStatus(status) {
        rollbacking = status;
    },
    async getSnapshotSetting(param) {
        return await database.getSetting({ key: config.setting.snapshotSetting })
    },
    async updateSnapshotSetting(param) {
        let { total, manual, auto } = param;
        let { errorId, message } = await afterMe.updateSnapshotSetting({ total, manual, schedule: auto });
        !errorId && await database.updateSetting({ key: config.setting.snapshotSetting }, { value: { total, manual, auto } });
        return { errorId, message };
    },
    async getSnapshot(param) {
        return await database.getSnapshot(param);
    },
    async getSnapshotInOperation() {
        return Boolean(await database.getSnapshotCount({ creating: true }) + await database.getSnapshotCount({ deleting: true }) + await database.getSnapshotCount({ rollbacking: true }));
    },
    async createSnapshot(param) {
        let result = false;
        let { name, description, isAuto = false, creating = true, deleting = false, rollbacking = false, createTime = new Date() } = param;
        let setting = await model.getSnapshotSetting();
        let limit = Number(setting.manual);
        let count = await database.getSnapshotCount({ isAuto: false });
        if (count < limit) {
            await database.addSnapshot({ name, description, isAuto, creating, deleting, rollbacking, createTime });
            socket.postEventStatus('snapshot', 11, name, true, false);
            let { errorId, data, message } = await afterMe.createSnapshot({ name, schedule: isAuto });
            if (!errorId) {
                await database.updateSnapshot({ name }, { createTime: new Date(data.createTime), creating: false });
                socket.postEventStatus('snapshot', 12, name, true, true);
                result = true;
            } else {
                handler.error(132, message, param);
                await database.deleteSnapshot({ name });
                socket.postEventStatus('snapshot', 12, name, false, true);
                result = false;
            }
        } else {
            socket.postEventStatus('snapshot', 12, name, false, true);
            result = false;
        }
        return result;
    },
    async updateSnapshot(param) {
        let { name, description } = param;
        await database.updateSnapshot({ name }, { description });
    },
    async deleteSnapshot(param) {
        let result = false;
        let { name } = param;
        await database.updateSnapshot({ name }, { deleting: true });
        let { errorId, message } = await afterMe.deleteSnapshot({ name });
        if (!errorId) {
            await database.deleteSnapshot({ name });
            socket.postEventStatus('snapshot', 13, name, true, true);
            result = true;
        } else {
            handler.error(134, message, param);
            await database.updateSnapshot({ name }, { deleting: false });
            socket.postEventStatus('snapshot', 14, name, false, true);
            result = false;
        }
        return result;
    },
    async batchDeleteSnapshot(param) {
        let result = false;
        let { names } = param;
        for (let name of names) {
            await database.updateSnapshot({ name }, { deleting: true });
        }
        let { errorId, message } = await afterMe.batchDeleteSnapshot({ names: String(names) });
        if (!errorId) {
            for (let name of names) {
                await database.deleteSnapshot({ name });
            }
            socket.postEventStatus('snapshot', 15, { total: names.length }, true, true);
            result = true;
        } else {
            handler.error(135, message, param);
            for (let name of names) {
                await database.updateSnapshot({ name }, { deleting: false });
            }
            socket.postEventStatus('snapshot', 16, { total: names.length }, false, true);
            result = false;
        }
        return result;
    },
    async rollbackSnapshot(param) {
        let result = false;
        let { name } = param;
        await database.updateSnapshot({ name }, { rollbacking: true });
        let { errorId, message } = await afterMe.rollbackSnapshot({ name });
        await database.updateSnapshot({ name }, { rollbacking: false });
        if (!errorId) {
            socket.postEventStatus('snapshot', 18, name, true, true);
            result = true;
        } else {
            handler.error(136, message, param);
            socket.postEventStatus('snapshot', 18, name, false, true);
            result = false;
        }
        return result;
    },
    async getSnapshotSchedule(param) {
        return await database.getSnapshotSchedule(param);
    },
    async createSnapshotSchedule(param) {
        let { name, createTime = new Date(), startTime = handler.startTime(), autoDisable, autoDisableTime, interval, deleteRound = false, description, isRunning = false } = param;
        await database.addSnapshotSchedule({ name, createTime, startTime, autoDisableTime: autoDisable ? autoDisableTime : 0, interval, deleteRound, description, isRunning });
    },
    async updateSnapshotSchedule(param) {
        let { name, description } = param;
        await database.updateSnapshotSchedule({ name }, { description });
    },
    async enableSnapshotSchedule(param) {
        let { name } = param;
        await database.updateSnapshotSchedule({ name }, { startTime: handler.startTime(), isRunning: true });
    },
    async disableSnapshotSchedule(param) {
        let { name } = param;
        await database.updateSnapshotSchedule({ name }, { isRunning: false });
    },
    async deleteSnapshotSchedule(param) {
        let { name } = param;
        await database.deleteSnapshotSchedule({ name });
    },
    async batchDeleteSnapshotSchedule(param) {
        let { names } = param;
        for (let name of names) {
            await database.deleteSnapshotSchedule({ name });
        }
    },
    async runSnapshotSchedule() {
        let currentTime = handler.currentTime();
        let isRunningSchedule = await database.getSnapshotSchedule({ isRunning: true });
        if (isRunningSchedule.length) {
            let { name, startTime, autoDisableTime, interval, deleteRound } = isRunningSchedule[0];
            let timeGapInSecond = (currentTime - startTime) / 1000;
            if (timeGapInSecond >= interval && !(timeGapInSecond % interval) && (!autoDisableTime || timeGapInSecond <= autoDisableTime)) {
                let snapshotSetting = await database.getSetting({ key: config.setting.snapshotSetting });
                let limit = Number(snapshotSetting.auto);
                let autoSnapshotList = await database.getSnapshot({ isAuto: true });
                let nameToCreate = name + '-' + await promise.runCommandInPromise('date "+%Y%m%d%H%M%S"');
                if (autoSnapshotList.length < limit) {
                    await database.addSnapshot({ name: nameToCreate, description: '', isAuto: true, creating: true, deleting: false, rollbacking: false, createTime: currentTime });
                    await status.sendEvent('snapshot', 11, nameToCreate, true, false);
                    let { errorId, data, message } = await afterMe.createSnapshot({ name: nameToCreate, schedule: true });
                    if (!errorId) {
                        await database.updateSnapshot({ name: nameToCreate }, { createTime: new Date(data.createTime), creating: false });
                        await status.sendEvent('snapshot', 12, nameToCreate, true, false);
                    } else {
                        handler.error(132, message, { name: nameToCreate, isAuto: true });
                        await database.deleteSnapshot({ name: nameToCreate });
                        await status.sendEvent('snapshot', 12, nameToCreate, false, false);
                    }
                } else if (deleteRound) {
                    let autoSnapshotWithoutDeletingOrRollbackingList = await database.getSnapshot({ isAuto: true, deleting: false, rollbacking: false });
                    let nameToDelete = autoSnapshotWithoutDeletingOrRollbackingList[0].name;
                    await database.updateSnapshot({ name: nameToDelete }, { deleting: true });
                    let res = await afterMe.deleteSnapshot({ name: nameToDelete });
                    if (!res.errorId) {
                        await database.deleteSnapshot({ name: nameToDelete });
                        await database.addSnapshot({ name: nameToCreate, description: '', isAuto: true, creating: true, deleting: false, rollbacking: false, createTime: currentTime });
                        await status.sendEvent('snapshot', 11, nameToCreate, true, false);
                        let { errorId, data, message } = await afterMe.createSnapshot({ name: nameToCreate, schedule: true });
                        if (!errorId) {
                            await database.updateSnapshot({ name: nameToCreate }, { createTime: new Date(data.createTime), creating: false });
                            await status.sendEvent('snapshot', 12, nameToCreate, true, false);
                        } else {
                            handler.error(132, message, { name: nameToCreate, isAuto: true });
                            await database.deleteSnapshot({ name: nameToCreate });
                            await status.sendEvent('snapshot', 12, nameToCreate, false, false);
                        }
                    } else {
                        handler.error(134, res.message, { name: nameToDelete, isAuto: true });
                        await database.updateSnapshot({ name: nameToDelete }, { deleting: false });
                    }
                }
            } else if (autoDisableTime && timeGapInSecond > autoDisableTime) {
                await database.updateSnapshotSchedule({ name }, { isRunning: false });
            }
        }
    }
};
module.exports = model;