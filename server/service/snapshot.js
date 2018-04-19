const database = require('./database');
const promise = require('../module/promise');
const handler = require('../module/handler');
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
    async createSnapshot(param) {
        let { name, description, isAuto = false, deleting = false, rollbacking = false, createTime = new Date() } = param;
        let setting = await model.getSnapshotSetting();
        let limit = Number(setting.manual);
        let count = await database.getSnapshotCount({ isAuto: false });
        if (count < limit) {
            await database.addSnapshot({ name, description, isAuto, deleting, rollbacking, createTime });
            return true;
        } else {
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
    async deleteSnapshots(param) {
        let { names } = param;
        for (let name of names) {
            await database.updateSnapshot({ name }, { deleting: true });
        }
    },
    async rollbackSnapshot(param) {
        let { name } = param;
        await database.updateSnapshot({ name }, { rollbacking: true });
        await promise.runTimeOutInPromise(60);
        await database.updateSnapshot({ name }, { rollbacking: false });
    },
    async getSnapshotTask(param) {
        return await database.getSnapshotTask(param);
    },
    async createSnapshotTask(param) {
        let { name, createTime = new Date(), startTime = handler.startTime(), autoDisableTime = 0, interval, deleteRound = false, description, isRunning = false } = param;
        await database.addSnapshotTask({ name, createTime, startTime, autoDisableTime, interval, deleteRound, description, isRunning });
    },
    async updateSnapshotTask(param) {
        let { name, description } = param;
        await database.updateSnapshotTask({ name }, { description });
    },
    async enableSnapshotTask(param) {
        let { name } = param;
        await database.updateSnapshotTask({ name }, { startTime: handler.startTime(), isRunning: true });
    },
    async disableSnapshotTask(param) {
        let { name } = param;
        await database.updateSnapshotTask({ name }, { isRunning: false });
    },
    async deleteSnapshotTask(param) {
        let { name } = param;
        await database.deleteSnapshotTask({ name });
    },
    async deleteSnapshotTasks(param) {
        let { names } = param;
        for (let name of names) {
            await database.deleteSnapshotTask({ name });
        }
    },
    async runSnapshotTask() {
        let currentTime = handler.currentTime();
        let isRunningTask = await database.getSnapshotTask({ isRunning: true });
        if (isRunningTask.length) {
            let { name, startTime, autoDisableTime, interval, deleteRound } = isRunningTask[0];
            let timeGapInSecond = (currentTime - startTime) / 1000;
            if (timeGapInSecond >= interval && !(timeGapInSecond % interval) && (!autoDisableTime || timeGapInSecond <= autoDisableTime)) {
                let snapshotSetting = await database.getSetting({ key: 'snapshotsetting' });
                let limit = Number(snapshotSetting.auto);
                let autoSnapshotList = await database.getSnapshot({ isAuto: true });
                let nameToCreate = name + '-' + await promise.runCommandInPromise('date "+%Y%m%d%H%M%S"');
                if (autoSnapshotList.length < limit) {
                    await database.addSnapshot({ name: nameToCreate, description: '', isAuto: true, deleting: false, rollbacking: false, createTime: currentTime });
                } else if (deleteRound) {
                    let autoSnapshotWithoutDeletingOrRollbackingList = await database.getSnapshot({ isAuto: true, deleting: false, rollbacking: false });
                    let nameToDelete = autoSnapshotWithoutDeletingOrRollbackingList[0].name;
                    await database.deleteSnapshot({ name: nameToDelete });
                    await database.addSnapshot({ name: nameToCreate, description: '', isAuto: true, deleting: false, rollbacking: false, createTime: currentTime });
                }
            } else if (autoDisableTime && timeGapInSecond > autoDisableTime) {
                await database.updateSnapshotTask({ name }, { isRunning: false });
            }
        }
    }
};
module.exports = model;