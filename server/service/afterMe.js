const config = require('../config');
const request = require('../module/request');
const promise = require('../module/promise');
const handler = require('../module/handler');
const model = {
    async getToken() {
        return await request.get(config.api.orcafs.gettoken, {}, {}, true);
    },
    async getDiskList(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.listdisk + param.ip, {}, token, true);
        if (!res.errorId) {
            res.data = res.data ? res.data.filter(i => (!i.isUsed)) : [];
            res.data.forEach(disk => {
                disk.totalSpace = handler.toByte(Number(disk.totalSpace.replace(/\SB/, '')), disk.totalSpace.replace(/\S+\d/, '')[0]);
            });
        }
        return res;
    },
    async getMetaNodeStatus(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.listmetanodes, param, token, true);
    },
    async getStorageNodeStatus(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.liststoragenodes, param, token, true);
    },
    async getStorageDiskSpace(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getstoragespace, param, token, true);
    },
    async getStorageTarget(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.liststoragetargets, param, token, true);
    },
    async getStorageThroughput(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.getiostat, param, token, true);
        if (!res.errorId) {
            let read = res.data.map(i => (i.read));
            let write = res.data.map(i => (i.write));
            let total = res.data.map(i => (i.total));
            let time = res.data.map(i => (i.time));
            res.data = { read, write, total, time };
        }
        return res;
    },
    async getUserMetaStats(param) {
        param.userOrClient = 'user';
        param.nodeType = 'meta';
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getstats, param, token, true);
    },
    async getUserStorageStats(param) {
        param.userOrClient = 'user';
        param.nodeType = 'storage';
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getstats, param, token, true);
    },
    async getClientMetaStats(param) {
        param.userOrClient = 'client';
        param.nodeType = 'meta';
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getstats, param, token, true);
    },
    async getClientStorageStats(param) {
        param.userOrClient = 'client';
        param.nodeType = 'storage';
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getstats, param, token, true);
    },
    async getEntryInfo(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.entryinfo, param, token, true);
        if (!res.errorId) {
            res.data.chunkSize = handler.toByte(Number(res.data.chunkSize.replace(/[a-zA-Z]/, '')), res.data.chunkSize.replace(/\d+/, ''));
            res.data.numTargets = Number(res.data.numTargets);
        }
        return res;
    },
    async getFiles(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.getfiles, param, token, true);
        if (!res.errorId) {
            if (res.data) {
                for (let i of Object.keys(res.data)) {
                    res.data[i].size = Number(res.data[i].size);
                }
            } else {
                res.data = [];
            }
            res.data = res.data.sort((prev, next) => (prev.name > next.name));
        }
        return res;
    },
    async setPattern(param) {
        param.chunkSize = String(param.chunkSize);
        param.numTargets = String(param.numTargets);
        let token = await model.getToken();
        return await request.post(config.api.orcafs.setpattern, param, token, true);
    },
    async updateSnapshotSetting(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.applysnapconf, param, token, true);
    },
    async getSnapshot(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.listsnapshot, param, token, true);
    },
    async createSnapshot(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.createsnapshot, param, token, true);
    },
    async deleteSnapshot(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.deletesnapshot, param, token, true);
    },
    async batchDeleteSnapshot(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.batchdeletesnap, param, token, true);
    },
    async rollbackSnapshot(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.rollbacksnapshot, param, token, true);
    },
    async getVersion(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getversion, param, token, true);
    },
    async getClusterTarget(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.listtargets, param, token, true);
        if (!res.errorId) {
            for (let i of Object.keys(res.data)) {
                let { targetId, nodeId, totalSpace, usedSpace, freeSpace, mountPath, hostname, service, isUsed } = res.data[i];
                res.data[i] = { targetId, mountPath, node: hostname, service: service === 'meta' ? 'metadata' : service, isUsed, nodeId, space: { total: totalSpace, used: usedSpace, free: freeSpace, usage: `${(usedSpace / totalSpace).toFixed(2)}%` } };
            }
        }
        return res;
    },
    async getNodeList(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.listallnodes, param, token, true);
        if (!res.errorId) {
            for (let i of Object.keys(res.data)) {
                let { hostname, ip, service, cpuUsage, memUsage, spaceUsage, spaceTotal, spaceUsed, spaceFree, status } = res.data[i];
                res.data[i] = { hostname, ip, service: service.map(i => (i === 'meta' ? 'metadata' : i)), isPureMgmt: service.length === 1 && service.includes('mgmt'), status, cpuUsage: `${cpuUsage.toFixed(2)}%`, memoryUsage: `${memUsage.toFixed(2)}%`, space: { total: spaceTotal, used: spaceUsed, free: spaceFree, usage: `${(spaceUsed / spaceTotal * 100).toFixed(2)}%` } };
            }
            res.data = res.data.sort((prev, next) => (prev.hostname > next.hostname));
        }
        return res;
    },
    async getNodeService(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getnodeservice, param, token, true);
    },
    async getNodeTarget(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.listnodetargets, param, token, true);
        if (!res.errorId) {
            for (let i of Object.keys(res.data)) {
                let { targetId, nodeId, totalSpace, usedSpace, freeSpace, mountPath, hostname, service, isUsed } = res.data[i];
                res.data[i] = { targetId, mountPath, node: hostname, service: service === 'meta' ? 'metadata' : service, isUsed, nodeId, space: { total: totalSpace, used: usedSpace, free: freeSpace, usage: `${(usedSpace / totalSpace).toFixed(2)}%` } };
            }
            res.data = res.data.sort((prev, next) => (prev.space.usage < next.space.usage));
        }
        return res;
    },
    async getClusterThroughputAndIops(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getclusteriostat, param, token, true, { data: { throughput: [], iops: [] } });
    },
    async getNodeCpuAndMemory(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.getphysicresource, param, token, true, { data: { cpu: 0, memory: 0 } });
        res.data.cpu = res.data.cpu.toFixed(2);
        res.data.memory = res.data.memory.toFixed(2);
        return res;
    },
    async getNodeThroughputAndIops(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getiostat, param, token, true, { data: { throughput: [], iops: [] } });
    },
    async createTarget(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.addstoragetarget, param, token, true);
    },
    async getBuddyGroup(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.listmirrorgroup, param, token, true, { data: [] });
        if (!res.errorId) {
            res.data = res.data || [];
            res.data = res.data.map(item => {
                let { type, groupId, primary, secondary } = item;
                primary = { targetId: primary.targetId, mountPath: primary.mountPath, node: primary.hostname, service: primary.service === 'meta' ? 'metadata' : primary.service, isUsed: primary.isUsed, nodeId: primary.nodeId, space: { total: primary.totalSpace, used: primary.usedSpace, free: primary.freeSpace, usage: `${(primary.usedSpace / primary.totalSpace).toFixed(2)}%` } };
                secondary = { targetId: secondary.targetId, mountPath: secondary.mountPath, node: secondary.hostname, service: secondary.service === 'meta' ? 'metadata' : secondary.service, isUsed: secondary.isUsed, nodeId: secondary.nodeId, space: { total: secondary.totalSpace, used: secondary.usedSpace, free: secondary.freeSpace, usage: `${(secondary.usedSpace / secondary.totalSpace).toFixed(2)}%` } };
                return { type, groupId, primary, secondary };
            });
        }
        return res;
    },
    async createBuddyGroup(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.createbuddymirror, param, token, true);
    },
    async getClient(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getclientlist, param, token, true, { data: [] });
    },
    async getNasServer(param) {
        param.opt = 'nasQuery';
        let token = await model.getToken();
        let res = await request.post(config.api.orcafs.nasmanager, param, token, true);
        if (!res.errorId) {
            res.data = res.data || [];
        }
        return res;
    },
    async createNasServer(param) {
        param.opt = 'nasAdd';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasmanager, param, token, true);
    },
    async getLocalAuthUserGroup(param) {
        param.opt = 'localgroupquery';
        let token = await model.getToken();
        return await request.get(config.api.orcafs.nasusermanager, param, token, true);
    },
    async addLocalAuthUserGroup(param) {
        param.opt = 'localgroupadd';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async updateLocalAuthUserGroup(param) {
        param.opt = 'localgroupchange';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async deleteLocalAuthUserGroup(param) {
        param.opt = 'localgroupdelete';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async getLocalAuthUser(param) {
        param.opt = 'localuserquery';
        let token = await model.getToken();
        return await request.get(config.api.orcafs.nasusermanager, param, token, true);
    },
    async addLocalAuthUser(param) {
        param.opt = 'localuseradd';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async updateLocalAuthUser(param) {
        param.opt = 'localuserchange';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async deleteLocalAuthUser(param) {
        param.opt = 'localuserdelete';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async addLocalAuthUserToGroup(param) {
        param.opt = 'localgroupadduser';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async removeLocalAuthUserFromGroup(param) {
        param.opt = 'localgroupremoveuser';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nasusermanager, param, token, true);
    },
    async getCIFSShare(param) {
        param.opt = 'nasscifsharequery';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nascifssharemanager, param, token, true);
    },
    async createCIFSShare(param) {
        param.opt = 'cifsaddshare';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nascifssharemanager, param, token, true);
    },
    async updateCIFSShare(param) {
        param.opt = 'cifschangeshare';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nascifssharemanager, param, token, true);
    },
    async deleteCIFSShare(param) {
        param.opt = 'cifsdeleteshare';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nascifssharemanager, param, token, true);
    },
    async addUserOrGroupToCIFSShare(param) {
        param.opt = 'cifsaddclient';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nascifssharemanager, param, token, true);
    },
    async updateUserOrGroupInCIFSShare(param) {
        param.opt = 'cifschangeclient';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nascifssharemanager, param, token, true);
    },
    async removeUserOrGroupFromCIFSShare(param) {
        param.opt = 'cifsdeleteclient';
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nascifssharemanager, param, token, true);
    },
    async getNFSShare(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getshareinfo, param, token, true, { data: [] });
    },
    async createNFSShare(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.addshareinfo, param, token, true);
    },
    async updateNFSShare(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nfsmodifyshare, param, token, true);
    },
    async deleteNFSShare(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nfsdeleteshare, param, token, true);
    },
    async getClientInNFSShare(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getclientinfo, param, token, true, { data: [] });
    },
    async createClientInNFSShare(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.addclientinfo, param, token, true);
    },
    async updateClientInNFSShare(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.modifyclientinfo, param, token, true);
    },
    async deleteClientInNFSShare(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.nfsdeleteclient, param, token, true);
    },
    async addClientToCluster(param) {
        let token = await model.getToken();
        return await request.post(config.api.orcafs.addclientnode, param, token, true);
    }
};
module.exports = model;