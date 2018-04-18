const config = require('../config');
const request = require('../module/request');
const promise = require('../module/promise');
const model = {
    toByte(value, unit) {
        let unitList = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        let byte = 0;
        for (let i in unitList) {
            if (unit === unitList[i]) {
                byte = Math.floor(value * Math.pow(1024, i));
                break;
            }
        }
        return byte;
    },
    async getToken() {
        return await request.get(config.api.orcafs.gettoken, {}, {}, true);
    },
    async getStorageNodesOverview(param) {
        param.timeSpanPerf = 1;
        let res = await request.get(config.api.admon.storagenodesoverview, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].value ? data[i].value : data[i];
        }
        data.status = Array.isArray(data.status) ? data.status : typeof data.status === 'object' ? [data.status] : [];
        data.status = data.status.map(i => ({ value: i['_'] === 'true', node: i.node, nodeNumID: Number(i.nodeNumID) }));
        for (let i of Object.keys(data)) {
            if (String(i).includes('diskPerf') && Array.isArray(data[i])) {
                data[i] = data[i].map(j => ({ value: Number(j['_']), time: Number(j['time']) }));
            } else if (String(i).includes('disk') && typeof data[i] === 'object') {
                for (let j of Object.keys(data[i])) {
                    data[i][j] = model.toByte(Number(data[i][j].replace(/\s\SiB/, '')), data[i][j].replace(/\S+\s/, '')[0]);
                }
            }
        }
        return data;
    },
    async getStorageNode(param) {
        param.timeSpanPerf = 1;
        let res = await request.get(config.api.admon.storagenode, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].value || data[i].target ? data[i].value || data[i].target : data[i];
        }
        data.general = { status: data.general.status === 'true', nodeID: data.general.nodeID, nodeNumID: Number(data.general.nodeNumID) };
        data.storageTargets = Array.isArray(data.storageTargets) ? data.storageTargets : typeof data.storageTargets === 'object' ? [data.storageTargets] : [];
        data.storageTargets = data.storageTargets.map(i => ({ id: i['_'], diskSpaceTotal: Number(i.diskSpaceTotal), diskSpaceFree: Number(i.diskSpaceFree), diskSpaceUsed: Number(i.diskSpaceTotal) - Number(i.diskSpaceFree), pathStr: i.pathStr }));
        for (let i of Object.keys(data)) {
            if (String(i).includes('diskPerf') && Array.isArray(data[i])) {
                data[i] = data[i].map(j => ({ value: Number(j['_']), time: Number(j['time']) }));
            } else if (String(i).includes('disk') && typeof data[i] === 'object') {
                for (let j of Object.keys(data[i])) {
                    data[i][j] = model.toByte(Number(data[i][j].replace(/\s\SiB/, '')), data[i][j].replace(/\S+\s/, '')[0]);
                }
            }
        }
        return data;
    },
    async getDiskList(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.listdisk + param.ip, {}, token, true);
        if (!res.errorId) {
            for (let i in res.data) {
                res.data[i].totalSpace = model.toByte(Number(res.data[i].totalSpace.replace(/\SB/, '')), res.data[i].totalSpace.replace(/\S+\d/, '')[0]);
            }
        }
        return res;
    },
    async getEntryInfo(param) {
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.entryinfo, param, token, true);
        if (!res.errorId) {
            res.data.chunkSize = model.toByte(Number(res.data.chunkSize.replace(/[a-zA-Z]/, '')), res.data.chunkSize.replace(/\d+/, ''));
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
            let dirList = [], fileList = [];
            for (let i in res.data) {
                res.data[i].isDir ? dirList.push(res.data[i]) : fileList.push(res.data[i]);
            }
            dirList = dirList.sort((prev, next) => (prev.name > next.name));
            fileList = fileList.sort((prev, next) => (prev.name > next.name));
            res.data = dirList.concat(fileList);
        }
        return res;
    },
    async setPattern(param) {
        param.chunkSize = String(param.chunkSize);
        param.numTargets = String(param.numTargets);
        let token = await model.getToken();
        return await request.post(config.api.orcafs.setpattern, param, token, true);
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
    async getMetaNodeStatus(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.listmetanodes, {}, token, true);
    },
    async getStorageNodeStatus(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.liststoragenodes, {}, token, true);
    },
    async getStorageDiskSpace(param) {
        let token = await model.getToken();
        return await request.get(config.api.orcafs.getstoragespace, {}, token, true);
    },
    async getStorageTarget(param) {
        let token = await model.getToken();
        //return await request.get(config.api.orcafs.liststoragetargets, param, token, true);
        return {
            errorId: 0,
            data: [
                {
                    targetId: 101,
                    nodeId: 1,
                    totalSpace: 53660876800,
                    usedSpace: 26324500480,
                    freeSpace: 27336376320,
                    storagePath: '/Orcafs-storage'
                }
            ]
        }
    }
};
module.exports = model;