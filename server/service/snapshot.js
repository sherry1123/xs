const database = require('./database');
const promise = require('../module/promise');
let rollbacking = false;
const currentTimeHandler = () => (new Date(new Date().toISOString().replace(/:\d+\.\d+/, ':00.000')));
const startTimeHandler = () => (new Date(new Date(new Date().getTime() + 60000).toISOString().replace(/:\d+\.\d+/, ':00.000')));
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
        let { name, isAuto = false, deleting = false, rollbacking = false, createTime = new Date() } = param;
        let setting = await model.getSnapshotSetting();
        let limit = Number(setting.manual);
        let count = await database.getSnapshotCount({ isAuto: false });
        if (count < limit) {
            await database.addSnapshot({ name, isAuto, deleting, rollbacking, createTime });
            return true;
        } else {
            return false;
        }
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
        await promise.runTimeOutInPromise(10);
        await database.updateSnapshot({ name }, { rollbacking: false });
    },
    async getSnapshotTask(param) {
        return await database.getSnapshotTask(param);
    },
    async createSnapshotTask(param) {
        let { name, createTime = new Date(), startTime = startTimeHandler(), autoDisableTime = 0, interval, deleteRound = false, isRunning = false } = param;
        await database.addSnapshotTask({ name, createTime, startTime, autoDisableTime, interval, deleteRound, isRunning });
    },
    async enableSnapshotTask(param) {
        let { name } = param;
        await database.updateSnapshotTask({ name }, { startTime: startTimeHandler(), isRunning: true });
    },
    async disableSnapshotTask(param) {
        let { name } = param;
        await database.updateSnapshotTask({ name }, { isRunning: false });
    },
    async deleteSnapshotTask(param) {
        let { name } = param;
        await database.deleteSnapshotTask({ name });
    },
    async runSnapshotTask() {
        let currentTime = currentTimeHandler();
        let isRunningTask = await database.getSnapshotTask({ isRunning: true });
        if (isRunningTask.length) {
            let { name, startTime, autoDisableTime, interval, deleteRound } = isRunningTask[0];
            let timeGapInSecond = (currentTime - startTime) / 1000;
            if (timeGapInSecond >= interval && (!autoDisableTime || timeGapInSecond <= autoDisableTime)) {
                let snapshotSetting = await database.getSetting({ key: 'snapshotsetting' });
                let limit = Number(snapshotSetting.auto);
                let autoSnapshotList = await database.getSnapshot({ isAuto: true });
                let nameToCreate = name + '-' + await promise.runCommandInPromise('date "+%Y%m%d%H%M%S"');
                if (autoSnapshotList.length < limit) {
                    await database.addSnapshot({ name: nameToCreate, isAuto: true, deleting: false, rollbacking: false, createTime: currentTime });
                } else if (deleteRound) {
                    let autoSnapshotWithoutDeletingOrRollbackingList = await database.getSnapshot({ isAuto: true, deleting: false, rollbacking: false });
                    let nameToDelete = autoSnapshotWithoutDeletingOrRollbackingList[0].name;
                    await database.deleteSnapshot({ name: nameToDelete });
                    await database.addSnapshot({ name: nameToCreate, isAuto: true, deleting: false, rollbacking: false, createTime: currentTime });
                }
            } else if (timeGapInSecond){
                await database.updateSnapshotTask({ name }, { isRunning: false });
            }
        }
    }
};
module.exports = model;