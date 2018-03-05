const dao = require('../module/dao');
const user = require('../model/user');
const setting = require('../model/setting');
const eventlog = require('../model/eventlog');
const auditlog = require('../model/auditlog');
const hardware = require('../model/hardware');
const model = {
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
        return await dao.findAll(eventlog, param);
    },
    async addEventLog(param) {
        return await dao.createOne(eventlog, param);
    },
    async updateEventLog(query, param) {
        return await dao.updateOne(eventlog, query, param);
    },
    async getAuditLog(param) {
        return await dao.findAll(auditlog, param);
    },
    async addAuditLog(param) {
        return await dao.createOne(auditlog, param);
    },
    async getHardware(param) {
        return await dao.findAll(hardware, param);
    },
    async addHardware(param) {
        return await dao.createOne(hardware, param);
    },
    async addSetting(param) {
        return await dao.createOne(setting, param);
    },
    async getSetting(param) {
        return await dao.findOne(setting, param);
    }
};
module.exports = model;