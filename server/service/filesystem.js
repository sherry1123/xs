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
    async getNodeList(param) {
        let res = await request.get(config.api.admon.nodelist, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = Array.isArray(data[i]) ? data[i] : typeof data[i] === 'object' ? [data[i]] : [];
            data[i] = data[i].map(j => ({ node: j.node['_'], nodeNumID: Number(j.node.nodeNumID), group: j.node.group }));
        }
        return data;
    },
    async getMetaNodesOverview(param) {
        let res = await request.get(config.api.admon.metanodesoverview, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].value ? data[i].value : data[i];
        }
        data.general = { nodeCount: Number(data.general.nodeCount), rootNode: data.general.rootNode };
        data.status = Array.isArray(data.status) ? data.status : typeof data.status === 'object' ? [data.status] : [];
        data.status = data.status.map(i => ({ value: i['_'] === 'true', node: i.node, nodeNumID: Number(i.nodeNumID) }));
        for (let i of Object.keys(data)) {
            if (String(i).includes('Requests') && Array.isArray(data[i])) {
                data[i] = data[i].map(j => ({ value: Number(j['_']), time: Number(j['time']) }));
            }
        }
        return data;
    },
    async getMetaNode(param) {
        let res = await request.get(config.api.admon.metanode, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].value ? data[i].value : data[i];
        }
        data.general = { status: data.general.status === 'true', nodeID: data.general.nodeID, nodeNumID: Number(data.general.nodeNumID), rootNode: data.general.rootNode === 'Yes' };
        for (let i of Object.keys(data)) {
            if (String(i).includes('Requests') && Array.isArray(data[i])) {
                data[i] = data[i].map(j => ({ value: Number(j['_']), time: Number(j['time']) }));
            }
        }
        return data;
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
    async getClientStats(param) {
        let res = await request.get(config.api.admon.clientstats, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].host ? data[i].host : data[i];
        }
        data.hosts = Array.isArray(data.hosts) ? data.hosts : typeof data.hosts === 'object' ? [data.hosts] : [];
        for (let i of Object.keys(data)) {
            if (Array.isArray(data[i])) {
                for (let j in data[i]) {
                    for (let k of Object.keys(data[i][j])) {
                        data[i][j][k] = k === 'ip' ? data[i][j][k] : { value: Number(data[i][j][k]['_']), id: Number(data[i][j][k].id) };
                    }
                }
            } else if (typeof data[i] === 'object') {
                for (let j of Object.keys(data[i])) {
                    data[i][j] = { value: Number(data[i][j]['_']), id: Number(data[i][j].id) };
                }
            } else if (typeof data[i] === 'string' && String(i).includes('ID')) {
                data[i] = Number(data[i]);
            }
        }
        return data;
    },
    async getUserStats(param) {
        let res = await request.get(config.api.admon.userstats, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].host ? data[i].host : data[i];
        }
        data.hosts = Array.isArray(data.hosts) ? data.hosts : typeof data.hosts === 'object' ? [data.hosts] : data.hosts;
        for (let i of Object.keys(data)) {
            if (Array.isArray(data[i])) {
                for (let j in data[i]) {
                    for (let k of Object.keys(data[i][j])) {
                        data[i][j][k] = k === 'ip' ? data[i][j][k] : { value: Number(data[i][j][k]['_']), id: Number(data[i][j][k].id) };
                    }
                }
            } else if (typeof data[i] === 'object') {
                for (let j of Object.keys(data[i])) {
                    data[i][j] = { value: Number(data[i][j]['_']), id: Number(data[i][j].id) };
                }
            } else if (typeof data[i] === 'string' && String(i).includes('ID')) {
                data[i] = Number(data[i]);
            }
        }
        return data;
    },
    async getKnownProblems(param) {
        let res = await request.get(config.api.admon.knownproblems, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = Array.isArray(data[i]) ? data[i] : typeof data[i] === 'object' ? [data[i]] : [];
        }
        for (let i of Object.keys(data)) {
            let type = i.replace('dead', '').replace('Nodes', '');
            let reason = 'Dead';
            for (let j in data[i]) {
                data[i][j].type = type;
                data[i][j].reason = reason;
            }
        }
        data = data.deadMetaNodes.concat(data.deadStorageNodes);
        return data;
    },
    async getDiskList(param) {
        let { ip } = param;
        let token = await model.getToken();
        let res = await request.get(config.api.orcafs.listdisk + ip, {}, token, true);
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
        let token = await model.getToken();
        return await request.post(config.api.orcafs.setpattern, param, token, true);
    }
};
module.exports = model;