const config = require('../config');
const dao = require('../module/dao');
const user = require('../model/user');
const setting = require('../model/setting');
const eventLog = require('../model/eventLog');
const auditLog = require('../model/auditLog');
const snapshot = require('../model/snapshot');
const nfsShare = require('../model/nfsShare');
const cifsShare = require('../model/cifsShare');
const nasServer = require('../model/nasServer');
const localAuthUser = require('../model/localAuthUser');
const snapshotSchedule = require('../model/snapshotSchedule');
const nodeCpuAndMemory = require('../model/nodeCpuAndMemory');
const localAuthUserGroup = require('../model/localAuthUserGroup');
const nodeThroughputAndIops = require('../model/nodeThroughtputAndIops');
const clusterThroughputAndIops = require('../model/clusterThroughputAndIops');
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
    async addSetting(param) {
        param = { key: param.key, value: JSON.stringify(param.value) };
        return await dao.createOne(setting, param);
    },
    async getSetting(param) {
        let data = await dao.findOne(setting, param);
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
    async getUserOrGroupFromCIFSShare(param) {
        let { shareName } = param;
        let { userOrGroupList } = await dao.findOne(cifsShare, { name: shareName });
        return userOrGroupList;
    },
    async addUserOrGroupToCIFSShare(param) {
        let { type, name, permission, shareName } = param;
        let userOrGroupList = await model.getUserOrGroupFromCIFSShare({ shareName });
        userOrGroupList = userOrGroupList.concat([{ type, name, permission }]);
        return await dao.updateOne(cifsShare, { name: shareName }, { userOrGroupList });
    },
    async updateUserOrGroupInCIFSShare(param) {
        let { name, type, permission, shareName } = param;
        let userOrGroupList = await model.getUserOrGroupFromCIFSShare({ shareName });
        userOrGroupList = userOrGroupList.map(user => (user.name === name && user.type === type ? { name, type, permission } : user));
        return await dao.updateOne(cifsShare, { name: shareName }, { userOrGroupList });
    },
    async removeUserOrGroupFromCIFSShare(param) {
        let { name, type, shareName } = param;
        let userOrGroupList = await model.getUserOrGroupFromCIFSShare({ shareName });
        userOrGroupList = userOrGroupList.filter(user => (user.name === name && user.type === type ? false : true));
        return await dao.updateOne(cifsShare, { name: shareName }, { userOrGroupList });
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
        let { type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint, path } = param;
        let clientList = await model.getClientInNFSShare({ path });
        clientList = clientList.concat([{ type, ip, permission, writeMode, permissionConstraint, rootPermissionConstraint }]);
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
    async getLocalAuthUserGroup(param) {
        let groupList = await dao.findAll(localAuthUserGroup, param);
        groupList = await Promise.all(groupList.map(async group => {
            let { name, description } = group;
            let userList = await model.getLocalAuthUserFromGroup({ groupName: name });
            return { name, description, userList };
        }));
        return groupList;
    },
    async addLocalAuthUserGroup(param) {
        return await dao.createOne(localAuthUserGroup, param);
    },
    async updateLocalAuthUserGroup(query, param) {
        return await dao.updateOne(localAuthUserGroup, query, param);
    },
    async deleteLocalAuthUserGroup(param) {
        return await dao.deleteOne(localAuthUserGroup, param);
    },
    async getLocalAuthUserFromGroup(param) {
        let { groupName } = param;
        let localAuthUserList = await dao.findAll(localAuthUser, {});
        let userInPrimaryGroup = localAuthUserList.filter(user => (user.primaryGroup === groupName));
        let userInSecondaryGroup = localAuthUserList.filter(user => (user.secondaryGroup.includes(groupName)));
        let userInGroup = userInPrimaryGroup.concat(userInSecondaryGroup);
        return userInGroup;
    },
    async addLocalAuthUserToGroup(param) {
        let { name, groupName } = param;
        let { secondaryGroup } = await dao.findOne(localAuthUser, { name });
        secondaryGroup = secondaryGroup.concat(groupName);
        await dao.updateOne(localAuthUser, { name }, { secondaryGroup });
    },
    async removeLocalAuthUserFromGroup(param) {
        let { name, groupName } = param;
        let { secondaryGroup } = await dao.findOne(localAuthUser, { name });
        secondaryGroup = secondaryGroup.filter(group => (group !== groupName));
        return await dao.updateOne(localAuthUser, { name }, { secondaryGroup });
    },
    async getLocalAuthUser(param) {
        return await dao.findAll(localAuthUser, param);
    },
    async addLocalAuthUser(param) {
        return await dao.createOne(localAuthUser, param);
    },
    async updateLocalAuthUser(query, param) {
        return await dao.updateOne(localAuthUser, query, param);
    },
    async deleteLocalAuthUser(param) {
        return await dao.deleteOne(localAuthUser, param);
    },
    async addClusterThroughputAndIops(param) {
        return await dao.createOne(clusterThroughputAndIops, param);
    },
    async addNodeThroughputAndIops(param) {
        return await dao.createOne(nodeThroughputAndIops, param);
    },
    async addNodeCpuAndMemory(param) {
        return await dao.createOne(nodeCpuAndMemory, param);
    },
    async getClusterThrought(param) {
        let throughputList = await dao.findAll(clusterThroughputAndIops, param, { iops: 0 }, { sort: { time: -1 }, limit: 60 });
        let total = throughputList.map(item => (item.throughput)).reverse();
        let time = throughputList.map(item => (item.time)).reverse();
        return { total, time };
    },
    async getClusterIops(param) {
        let iopsList = await dao.findAll(clusterThroughputAndIops, param, { throughput: 0 }, { sort: { time: -1 }, limit: 60 });
        let total = iopsList.map(item => (item.iops)).reverse();
        let time = iopsList.map(item => (item.time)).reverse();
        return { total, time };
    },
    async getNodeCpu(param) {
        let { hostname } = param;
        let data = await dao.findAll(nodeCpuAndMemory, {}, {}, { sort: { time: -1 }, limit: 60 });
        let hostList = data[0].hostList;
        let index = hostList.indexOf(hostname);
        let total = data.map(item => (item.dataList[index] ? item.dataList[index].cpu : 0)).reverse();
        let time = data.map(item => (item.time)).reverse();
        return { total, time };
    },
    async getNodeMemory(param) {
        let { hostname } = param;
        let data = await dao.findAll(nodeCpuAndMemory, {}, {}, { sort: { time: -1 }, limit: 60 });
        let hostList = data[0].hostList;
        let index = hostList.indexOf(hostname);
        let total = data.map(item => (item.dataList[index] ? item.dataList[index].memory : 0)).reverse();
        let time = data.map(item => (item.time)).reverse();
        return { total, time };
    },
    async getNodeThroughput(param) {
        let { hostname } = param;
        let data = await dao.findAll(nodeThroughputAndIops, {}, {}, { sort: { time: -1 }, limit: 60 });
        let hostList = data[0].hostList;
        let index = hostList.indexOf(hostname);
        let read = data.map(item => (item.dataList[index] ? item.dataList[index].throughput.read : 0)).reverse();
        let write = data.map(item => (item.dataList[index] ? item.dataList[index].throughput.write : 0)).reverse();
        let time = data.map(item => (item.time)).reverse();
        return { read, write, time };
    },
    async getNodeIops(param) {
        let { hostname } = param;
        let data = await dao.findAll(nodeThroughputAndIops, {}, {}, { sort: { time: -1 }, limit: 60 });
        let hostList = data[0].hostList;
        let index = hostList.indexOf(hostname);
        let total = data.map(item => (item.dataList[index] ? item.dataList[index].iops : 0)).reverse();
        let time = data.map(item => (item.time)).reverse();
        return { total, time };
    },
    async getNasServer(param) {
        return await dao.findAll(nasServer, param);
    },
    async addNasServer(param) {
        return await dao.createOne(nasServer, param);
    },
    async updateNasServer(query, param) {
        return await dao.updateOne(nasServer, query, param);
    },
    async getServiceAndClientFromCluster() {
        let initParam = await model.getSetting({ key: config.setting.initParam });
        return { metadataServerIPs: initParam.metadataServerIPs, storageServerIPs: initParam.storageServerIPs, managementServerIPs: initParam.managementServerIPs, clientIPs: initParam.clientIPs };
    },
    async addClientToCluster(param) {
        let { ip } = param;
        let initParam = await model.getSetting({ key: config.setting.initParam });
        initParam.clientIPs = Array.from(new Set(initParam.clientIPs.concat([ip])));
        return await model.updateSetting({ key: config.setting.initParam }, { value: initParam });
    },
    async addMetadataToCluster(param) {
        let { ip } = param;
        let initParam = await model.getSetting({ key: config.setting.initParam });
        let nodeList = await model.getSetting({ key: config.setting.nodeList });
        initParam.metadataServerIPs = Array.from(new Set(initParam.metadataServerIPs.concat([ip])));
        nodeList = Array.from(new Set(nodeList.concat([ip])));
        await model.updateSetting({ key: config.setting.initParam }, { value: initParam });
        await model.updateSetting({ key: config.setting.nodeList }, { value: nodeList });
    },
    async addStorageToCluster(param) {
        let { ip } = param;
        let initParam = await model.getSetting({ key: config.setting.initParam });
        let nodeList = await model.getSetting({ key: config.setting.nodeList });
        initParam.storageServerIPs = Array.from(new Set(initParam.storageServerIPs.concat([ip])));
        nodeList = Array.from(new Set(nodeList.concat([ip])));
        await model.updateSetting({ key: config.setting.initParam }, { value: initParam });
        await model.updateSetting({ key: config.setting.nodeList }, { value: nodeList });
    },
    async addManagementToCluster(param) {
        let { ip } = param;
        let initParam = await model.getSetting({ key: config.setting.initParam });
        let nodeList = await model.getSetting({ key: config.setting.nodeList });
        initParam.managementServerIPs = Array.from(new Set(initParam.managementServerIPs.concat([ip])));
        nodeList = Array.from(new Set(nodeList.concat([ip])));
        await model.updateSetting({ key: config.setting.initParam }, { value: initParam });
        await model.updateSetting({ key: config.setting.nodeList }, { value: nodeList });
    }
};
module.exports = model;