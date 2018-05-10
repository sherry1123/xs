const config = require('../config');
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
        return await database.getSetting({ key: 'snapshotsetting' })
    },
    async updateSnapshotSetting(param) {
        let { total, manual, auto } = param;
        await database.updateSetting({ key: 'snapshotsetting' }, { value: { total, manual, auto } });
    },
    async getSnapshot(param) {
        return await database.getSnapshot(param);
    },
    async getSnapshotInOperation() {
        return Boolean(await database.getSnapshotCount({ creating: true }) + await database.getSnapshotCount({ deleting: true }) + await database.getSnapshotCount({ rollbacking: true }));
    },
    async createSnapshot(param) {
        let { name, description, isAuto = false, creating = true, deleting = false, rollbacking = false, createTime = new Date() } = param;
        let setting = await model.getSnapshotSetting();
        let limit = Number(setting.manual);
        let count = await database.getSnapshotCount({ isAuto: false });
        if (count < limit) {
            await database.addSnapshot({ name, description, isAuto, creating, deleting, rollbacking, createTime });
            socket.postEventStatus('snapshot', 11, name, true, false);
            await promise.runTimeOutInPromise(10);
            await database.updateSnapshot({ name }, { creating: false });
            socket.postEventStatus('snapshot', 12, name, true, true);
            return true;
        } else {
            socket.postEventStatus('snapshot', 12, name, false, true);
            return false;
        }
    },
    async updateSnapshot(param) {
        let { name, description } = param;
        await database.updateSnapshot({ name }, { description });
    },
    async deleteSnapshot(param) {
        let { name } = param;
        await database.updateSnapshot({ name }, { deleting: true });
        await promise.runTimeOutInPromise(5);
        await database.deleteSnapshot({ name });
    },
    async batchDeleteSnapshot(param) {
        let { names } = param;
        for (let name of names) {
            await database.updateSnapshot({ name }, { deleting: true });
        }
        await promise.runTimeOutInPromise(5);
        for (let name of names) {
            await database.deleteSnapshot({ name });
        }
    },
    async rollbackSnapshot(param) {
        let { name } = param;
        await database.updateSnapshot({ name }, { rollbacking: true });
        await promise.runTimeOutInPromise(20);
        await database.updateSnapshot({ name }, { rollbacking: false });
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
                let snapshotSetting = await database.getSetting({ key: 'snapshotsetting' });
                let limit = Number(snapshotSetting.auto);
                let autoSnapshotList = await database.getSnapshot({ isAuto: true });
                let nameToCreate = name + '-' + await promise.runCommandInPromise('date "+%Y%m%d%H%M%S"');
                if (autoSnapshotList.length < limit) {
                    await database.addSnapshot({ name: nameToCreate, description: '', isAuto: true, creating: true, deleting: false, rollbacking: false, createTime: currentTime });
                    await request.post(config.api.server.receiveevent, { channel: 'snapshot', code: 11, target: nameToCreate, result: true, notify: false }, {}, true);
                    await promise.runTimeOutInPromise(10);
                    await database.updateSnapshot({ name: nameToCreate }, { creating: false });
                } else if (deleteRound) {
                    let autoSnapshotWithoutDeletingOrRollbackingList = await database.getSnapshot({ isAuto: true, deleting: false, rollbacking: false });
                    let nameToDelete = autoSnapshotWithoutDeletingOrRollbackingList[0].name;
                    await database.deleteSnapshot({ name: nameToDelete });
                    await database.addSnapshot({ name: nameToCreate, description: '', isAuto: true, creating: true, deleting: false, rollbacking: false, createTime: currentTime });
                    await request.post(config.api.server.receiveevent, { channel: 'snapshot', code: 11, target: nameToCreate, result: true, notify: false }, {}, true);
                    await promise.runTimeOutInPromise(10);
                    await database.updateSnapshot({ name: nameToCreate }, { creating: false });
                }
            } else if (autoDisableTime && timeGapInSecond > autoDisableTime) {
                await database.updateSnapshotSchedule({ name }, { isRunning: false });
            }
        }
    }
};
module.exports = model;