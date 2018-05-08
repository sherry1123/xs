const dao = require('../module/dao');
const user = require('../model/user');
const setting = require('../model/setting');
const eventLog = require('../model/eventLog');
const auditLog = require('../model/auditLog');
const hardware = require('../model/hardware');
const snapshot = require('../model/snapshot');
const nasExport = require('../model/nasExport');
const snapshotSchedule = require('../model/snapshotSchedule');
const model = {
    async login(param) {
        return await dao.findOne(user, param);
    },
    async getUser(param) {
        return await dao.findAll(user, param);
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
        return await dao.findAll(eventLog, param, {}, { sort: { time: -1 } });
    },
    async addEventLog(param) {
        return await dao.createOne(eventLog, param);
    },
    async updateEventLog(query, param) {
        return await dao.updateOne(eventLog, query, param);
    },
    async getAuditLog(param) {
        return await dao.findAll(auditLog, param, {}, { sort: { time: -1 } });
    },
    async addAuditLog(param) {
        return await dao.createOne(auditLog, param);
    },
    async getHardware(param) {
        return await dao.findAll(hardware, param, {}, { sort: { date: -1 }, limit: 200 });
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
    async getSnapshotSchedule(param) {
        return await dao.findAll(snapshotSchedule, param);
    },
    async addSnapshotSchedule(param) {
        return await dao.createOne(snapshotSchedule, param);
    },
    async updateSnapshotSchedule(query, param) {
        return await dao.updateOne(snapshotSchedule, query, param);
    },
    async deleteSnapshotSchedule(param) {
        return await dao.deleteOne(snapshotSchedule, param);
    },
    async getNasExport(param) {
        return await dao.findAll(nasExport, param);
    },
    async addNasExport(param) {
        return await dao.createOne(nasExport, param);
    },
    async updateNasExport(query, param) {
        return await dao.updateOne(nasExport, query, param);
    },
    async deleteNasExport(param) {
        return await dao.deleteOne(nasExport, param);
    }
};
module.exports = model;