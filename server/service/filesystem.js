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
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        if (typeof(data.status) === 'object') {
            data.status = [data.status];
        }
        for (let i in data.status) {
            data.status[i] = { value: data.status[i].value['_'], hostname: data.status[i].value['$'].node, nodeNumID: data.status[i].value['$'].nodeNumID };
        }
        for (let i of Object.keys(data)) {
            if (typeof(data[i]) === 'string' & data[i] === '') {
                data[i] = '0.000 MiB';
            }
        }
        for (let i of Object.keys(data)) {
            if (typeof(data[i]) === 'string' & String(data[i]).includes('MiB')) {
                data[i] = Number(data[i].replace(' MiB', ''));
            } else if (typeof(data[i] === 'object')) {
                for (let j of Object.keys(data[i])) {
                    if (String(data[i][j]).includes('MiB')) {
                        data[i][j] = Number(data[i][j].replace(' MiB', ''));
                    }
                }
            }
        }
        return data;
    },
    async getStorageNode(param) {
        let res = await request.get(config.api.admon.storagenode, param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        data.storageTargets = data.storageTargets === '' ? [] : data.storageTargets;
        for (let i of Object.keys(data)) {
            if (typeof(data[i]) === 'string' & data[i] === '' & i.includes('diskPerf')) {
                data[i] = '0.000 MiB';
            }
        }
        for (let i of Object.keys(data)) {
            if (typeof(data[i]) === 'string' & String(data[i]).includes('MiB')) {
                data[i] = Number(data[i].replace(' MiB', ''));
            } else if (typeof(data[i] === 'object')) {
                for (let j of Object.keys(data[i])) {
                    if (String(data[i][j]).includes('MiB')) {
                        data[i][j] = Number(data[i][j].replace(' MiB', ''));
                    }
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