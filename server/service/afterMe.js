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
            res.data = res.data ? res.data : [];
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
    }
};
module.exports = model;