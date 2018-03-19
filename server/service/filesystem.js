const config = require('../config');
const request = require('../module/request');
const promise = require('../module/promise');
const model = {
    async getToken() {
        return await request.get(config.api.orcafs.gettoken);
    },
    async getNodeList(param) {
        let res = await request.get('http://192.168.100.101:8000/XML_NodeList', param, {}, false);
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
        let res = await request.get('http://192.168.100.101:8000/XML_MetanodesOverview', param, {}, false);
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
        let res = await request.get('http://192.168.100.101:8000/XML_Metanode', param, {}, false);
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
        let res = await request.get('http://192.168.100.101:8000/XML_StoragenodesOverview', param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        data.status = { value: data.status.value['_'], hostname: data.status.value['$'].node, nodeNumID: data.status.value['$'].nodeNumID };
        for (let i of Object.keys(data)) {
            if (typeof (data[i]) === 'string' & data[i] === '') {
                data[i] = '0.000 MiB';
            }
        }
        return data;
    },
    async getStorageNode(param) {
        let res = await request.get('http://192.168.100.101:8000/XML_Storagenode', param, {}, false);
        let json = await promise.xmlToJsonInPromise(res, { explicitArray: false });
        let data = json.data;
        for (let i of Object.keys(data)) {
            if (typeof (data[i]) === 'string' & data[i] === '' & i.includes('diskPerf')) {
                data[i] = '0.000 MiB';
            }
        }
        return data;
    },
    async getClientStats(param) {
        let res = await request.get('http://192.168.100.101:8000/XML_ClientStats', param, {}, false);
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
        let res = await request.get('http://192.168.100.101:8000/XML_UserStats', param, {}, false);
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