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
                let { targetId, nodeId, totalSpace, usedSpace, freeSpace, mountPath, hostname, service } = res.data[i];
                res.data[i] = { targetId, mountPath, node: hostname, service: service === 'meta' ? 'metadata' : service, nodeId, space: { total: totalSpace, used: usedSpace, free: freeSpace, usage: `${(usedSpace / totalSpace).toFixed(2)}%` } };
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
                let { targetId, nodeId, totalSpace, usedSpace, freeSpace, mountPath, hostname, service } = res.data[i];
                res.data[i] = { targetId, mountPath, node: hostname, service: service === 'meta' ? 'metadata' : service, nodeId, space: { total: totalSpace, used: usedSpace, free: freeSpace, usage: `${(usedSpace / totalSpace).toFixed(2)}%` } };
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
    }
};
module.exports = model;