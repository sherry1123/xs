const dao = require('../module/dao');
const user = require('../model/user');
const eventlog = require('../model/eventlog');
const auditlog = require('../model/auditlog');
const hardware = require('../model/hardware');
const model = {
    async getUser(param) {
        return await dao.findSome(user, param);
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
        return await dao.findSome(eventlog, param);
    },
    async addEventLog(param) {
        return await dao.createOne(eventlog, param);
    },
    async updateEventLog(query, param) {
        return await dao.updateOne(eventlog, query, param);
    },
    async getAuditLog(param) {
        return await dao.findSome(auditlog, param);
    },
    async addAuditLog(param) {
        return await dao.createOne(auditlog, param);
    },
    async getHardware(param) {
        return await dao.findSome(hardware, param);
    },
    async addHardware(param) {
        return await dao.createOne(hardware, param);
    }
}
module.exports = model;