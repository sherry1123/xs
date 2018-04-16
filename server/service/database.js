const dao = require('../module/dao');
const user = require('../model/user');
const setting = require('../model/setting');
const eventlog = require('../model/eventlog');
const auditlog = require('../model/auditlog');
const hardware = require('../model/hardware');
const snapshot = require('../model/snapshot');
const snapshottask = require('../model/snapshottask');
const model = {
    async getUser(param) {
        return await dao.findOne(user, param);
    },
    async addUser(param) {
        return await dao.createOne(user, param);
    },
    async updateUser(query, param) {
        return await dao.updateOne(user, query, param);
    },
    async deleteUser(param) {
        return await dao.deleteOne(user, param);
    },
    async getEventLog(param) {
        return await dao.findAll(eventlog, param, {}, { sort: { time: -1 } });
    },
    async addEventLog(param) {
        return await dao.createOne(eventlog, param);
    },
    async updateEventLog(query, param) {
        return await dao.updateOne(eventlog, query, param);
    },
    async getAuditLog(param) {
        return await dao.findAll(auditlog, param, {}, { sort: { time: -1 } });
    },
    async addAuditLog(param) {
        return await dao.createOne(auditlog, param);
    },
    async getHardware(param) {
        return await dao.findAll(hardware, param, { _id: 0, __v: 0 }, { sort: { date: -1 }, limit: 200 });
    },
    async addHardware(param) {
        return await dao.createOne(hardware, param);
    },
    async addSetting(param) {
        param = { key: param.key, value: JSON.stringify(param.value) };
        return await dao.createOne(setting, param);
    },
    async getSetting(param) {
        let data = await dao.findOne(setting, param, { _id: 0, __v: 0 });
        return JSON.parse(data.value);
    },
    async updateSetting(query, param) {
        param = { value: JSON.stringify(param.value) };
        return await dao.updateOne(setting, query, param);
    },
    async getSnapshot(param) {
        return await dao.findAll(snapshot, param);
    },
    async getSnapshotCount(param) {
        return await dao.count(snapshot, param);
    },
    async addSnapshot(param) {
        return await dao.createOne(snapshot, param);
    },
    async updateSnapshot(query, param) {
        return await dao.updateOne(snapshot, query, param);
    },
    async deleteSnapshot(param) {
        return await dao.deleteOne(snapshot, param);
    },
    async getSnapshotTask(param) {
        return await dao.findAll(snapshottask, param);
    },
    async addSnapshotTask(param) {
        return await dao.createOne(snapshottask, param);
    },
    async updateSnapshotTask(query, param) {
        return await dao.updateOne(snapshottask, query, param);
    },
    async deleteSnapshotTask(param) {
        return await dao.deleteOne(snapshottask, param);
    }
};
module.exports = model;