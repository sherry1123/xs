const dao = require('../module/dao');
const user = require('../model/user');
const setting = require('../model/setting');
const eventLog = require('../model/eventLog');
const auditLog = require('../model/auditLog');
const hardware = require('../model/hardware');
const snapshot = require('../model/snapshot');
const nfsShare = require('../model/nfsShare');
const cifsShare = require('../model/cifsShare');
const localUser = require('../model/localUser');
const localUserGroup = require('../model/localUserGroup');
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
    async getCIFSShare(param) {
        return await dao.findAll(cifsShare, param);
    },
    async addCIFSShare(param) {
        return await dao.createOne(cifsShare, param);
    },
    async updateCIFSShare(query, param) {
        return await dao.updateOne(cifsShare, query, param);
    },
    async deleteCIFSShare(param) {
        return await dao.deleteOne(cifsShare, param);
    },
    async getUserInCIFSShare(param) {
        let { name } = param;
        let { userList } = await dao.findOne(cifsShare, { name });
        return userList;
    },
    async addUserInCIFSShare(param) {
        let { names, type, permissionLevel, shareName } = param;
        let userList = await model.getUserInCIFSShare({ name: shareName });
        for (let name of names) {
            userList.push({ name, type, permissionLevel });
        }
        return await dao.updateOne(cifsShare, { name: shareName }, { userList });
    },
    async updateUserInCIFSShare(query, param) {
        let { name, type, permissionLevel, shareName } = param;
        let userList = await model.getUserInCIFSShare({ name: shareName });
        userList = userList.map(user => (user.name === name ? { name, type, permissionLevel } : user));
        return await dao.updateOne(cifsShare, { name: shareName }, { userList });
    },
    async deleteUserInCIFSShare(param) {
        let { name, shareName } = param;
        let userList = await model.getUserInCIFSShare({ name: shareName });
        userList = userList.filter(user => (user.name === name ? false : true));
        return await dao.updateOne(cifsShare, { name: shareName }, { userList });
    },
    async getNFSShare(param) {
        return await dao.findAll(nfsShare, param);
    },
    async addNFSShare(param) {
        return await dao.createOne(nfsShare, param);
    },
    async updateNFSShare(query, param) {
        return await dao.updateOne(nfsShare, query, param);
    },
    async deleteNFSShare(param) {
        return await dao.deleteOne(nfsShare, param);
    },
    async getClientInNFSShare(param) {
        let { path } = param;
        let { clientList } = await dao.findOne(nfsShare, { path });
        return clientList;
    },
    async addClientInNFSShare(param) {
        let { type, ips, permission, writeMode, permissionConstraint, rootPermissionConstraint, path } = param;
        let clientList = await model.getClientInNFSShare({ path });
        for (let ip of ips.split(';')) {
            clientList.push({ type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint });
        }
        return await dao.updateOne(nfsShare, { path }, { clientList });
    },
    async updateClientInNFSShare(param) {
        let { type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint, path } = param;
        let clientList = await model.getClientInNFSShare({ path });
        clientList = clientList.map(client => (client.ip === ip ? { type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint } : client))
        return await dao.updateOne(nfsShare, { path }, { clientList });
    },
    async deleteClientInNFSShare(param) {
        let { ip, path } = param;
        let clientList = await model.getClientInNFSShare({ path });
        clientList = clientList.filter(client => (client.ip === ip ? false : true));
        return await dao.updateOne(nfsShare, { path }, { clientList });
    },
    async getLocalUserGroup(param) {
        return await dao.findAll(localUserGroup, param);
    },
    async addLocalUserGroup(param) {
        return await dao.createOne(localUserGroup, param);
    },
    async updateLocalUserGroup(query, param) {
        return await dao.updateOne(localUserGroup, query, param);
    },
    async deleteLocalUserGroup(param) {
        return await dao.deleteOne(localUserGroup, param);
    },
    async getLocalUser(param) {
        return await dao.findAll(localUser, param);
    },
    async addLocalUser(param) {
        return await dao.createOne(localUser, param);
    },
    async updateLocalUser(query, param) {
        return await dao.updateOne(localUser, query, param);
    },
    async deleteLocalUser(param) {
        return await dao.deleteOne(localUser, param);
    }
};
module.exports = model;