const config = require('../config');
const request = require('../module/request');
const promise = require('../module/promise');
const model = {
    async getToken() {
        return await request.get(config.api.orcafs.gettoken);
    },
    async getNodeList(param) {
        let res = await request.get(config.api.admon.nodelist, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { charkey: 'hostname', attrkey: 'state' });
        let data = json.data;
        let result = { mgmtd: [], meta: [], storage: [], admon: [] };
        for (let i of Object.keys(data)) {
            result[i] = data[i].map(j => {
                let obj = Object.assign(j.node[0], j.node[0].state);
                delete obj.state;
                return obj;
            });
        }
        return result;
    },
    async getMetaNodesOverview(param) {
        let res = await request.get(config.api.admon.metanodesoverview, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        let result = { general: {}, status: {}, workRequests: [], queuedRequests: [] };
        result.general = data.general;
        result.status = { value: data.status.value['_'], hostname: data.status.value['$'].node, nodeNumID: data.status.value['$'].nodeNumID };
        for (let i of data.workRequests.value) {
            result.workRequests.push({ time: i['$'].time, value: i['_'] });
        }
        for (let i of data.queuedRequests.value) {
            result.queuedRequests.push({ time: i['$'].time, value: i['_'] });
        }
        return result;
    },
    async getMetaNode(param) {
        let res = await request.get(config.api.admon.metanode, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        let result = { general: {}, workRequests: [], queuedRequests: [] };
        result.general = data.general;
        for (let i of data.workRequests.value) {
            result.workRequests.push({ time: i['$'].time, value: i['_'] });
        }
        for (let i of data.queuedRequests.value) {
            result.queuedRequests.push({ time: i['$'].time, value: i['_'] });
        }
        return result;
    },
    async getStorageNodesOverview(param) {
        let res = await request.get(config.api.admon.storagenodesoverview, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].value ? data[i].value : data[i];
        }
        data.status = Array.isArray(data.status) ? data.status : typeof (data.status) === 'object' ? [data.status] : [];
        data.status = data.status.map(i => ({ value: i['_'] === 'true', node: i.node, nodeNumID: Number(i.nodeNumID) }));
        for (let i of Object.keys(data)) {
            if (String(i).includes('diskPerf') && Array.isArray(data[i])) {
                data[i] = data[i].map(j => ({ value: Number(j['_']), time: Number(j['time']) }));
            } else if (String(i).includes('disk') && typeof (data[i]) === 'object') {
                for (let j of Object.keys(data[i])) {
                    data[i][j] = Number(data[i][j].replace(/\s\SiB/, ''));
                }
            }
        }
        return data;
    },
    async getStorageNode(param) {
        let res = await request.get(config.api.admon.storagenode, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false, mergeAttrs: true });
        let data = json.data;
        for (let i of Object.keys(data)) {
            data[i] = data[i].value || data[i].target ? data[i].value || data[i].target : data[i];
        }
        data.general = { status: data.general.status === 'true', nodeID: data.general.nodeID, nodeNumID: Number(data.general.nodeNumID) };
        data.storageTargets = Array.isArray(data.storageTargets) ? data.storageTargets : typeof (data.storageTargets) === 'object' ? [data.storageTargets] : [];
        data.storageTargets = data.storageTargets.map(i => ({ id: i['_'], diskSpaceTotal: Number(i.diskSpaceTotal), diskSpaceFree: Number(i.diskSpaceFree), pathStr: i.pathStr }));
        for (let i of Object.keys(data)) {
            if (String(i).includes('diskPerf') && Array.isArray(data[i])) {
                data[i] = data[i].map(j => ({ value: Number(j['_']), time: Number(j['time']) }));
            } else if (String(i).includes('disk') && typeof (data[i]) === 'object') {
                for (let j of Object.keys(data[i])) {
                    data[i][j] = Number(data[i][j].replace(/\s\SiB/, ''));
                }
            }
        }
        return data;
    },
    async getClientStats(param) {
        let res = await request.get(config.api.admon.clientstats, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        if (typeof (data.hosts) === 'object') {
            data.hosts = [data.hosts.host];
        }
        if (!data.hosts || data.hosts === '') {
            data.hosts = [];
            data.sum = {};
        } else {
            for (let i of data.hosts) {
                for (let j of Object.keys(i)) {
                    i[j] = j === '$' ? i['$'].ip : { id: i[j]['$'].id, value: i[j]['_'] };
                }
                i.host = i['$'];
                delete i['$'];
            }
            for (let i of Object.keys(data.sum)) {
                data.sum[i] = { id: data.sum[i]['$'].id, value: data.sum[i]['_'] };
            }
        }
        return data;
    },
    async getUserStats(param) {
        let res = await request.get(config.api.admon.userstats, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        if (typeof (data.hosts) === 'object') {
            data.hosts = [data.hosts.host];
        }
        if (!data.hosts || data.hosts === '') {
            data.hosts = [];
            data.sum = {};
        } else {
            for (let i of data.hosts) {
                for (let j of Object.keys(i)) {
                    i[j] = j === '$' ? i['$'].ip : { id: i[j]['$'].id, value: i[j]['_'] };
                }
                i.host = i['$'];
                delete i['$'];
            }
            for (let i of Object.keys(data.sum)) {
                data.sum[i] = { id: data.sum[i]['$'].id, value: data.sum[i]['_'] };
            }
        }
        return data;
    }
};
module.exports = model;