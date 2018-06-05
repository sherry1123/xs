const email = require('./email');
const status = require('./status');
const config = require('../config');
const afterMe = require('./afterMe');
const database = require('./database');
const snapshot = require('./snapshot');
const promise = require('../module/promise');
const handler = require('../module/handler');
const model = {
    async sendMail() {
        try {
            await email.sendMail();
        } catch (error) {
            handler.error(62, error);
        }
    },
    async createSnapshot() {
        try {
            await snapshot.runSnapshotSchedule();
        } catch (error) {
            handler.error(148, error);
        }
    },
    async sendChangePasswordMessage() {
        try {
            let [{ password }] = await database.getUser({ username: 'admin' });
            password === '123456' && await status.sendEvent('user', 21, { username: 'admin', password: '123456' }, false, true);
        } catch (error) {
            handler.error(52, error);
        }
    },
    async getClusterThroughputAndIops() {
        let time = new Date().getTime();
        let { data: { throughput, iops } } = await afterMe.getClusterThroughputAndIops();
        let throughputList = throughput.reverse().slice(0, 15);
        let iopsList = iops.reverse().slice(0, 15);
        let totalThroughput = 0;
        let totalIops = 0;
        if (throughputList.length && iopsList.length) {
            throughputList.forEach(item => {
                totalThroughput += item.total
            });
            iopsList.forEach(item => {
                totalIops += item.total
            });
        }
        await database.addClusterThroughputAndIops({ throughput: totalThroughput, iops: totalIops, time });
    },
    async getNodeCpuAndMemory() {
        let time = new Date().getTime();
        let nodeList = await database.getSetting({ key: config.setting.nodeList });
        let hostList = await Promise.all(nodeList.map(async node => (await promise.runCommandInRemoteNodeInPromise(node, 'hostname'))));
        let dataList = await Promise.all(hostList.map(async hostname => (Object.assign(await afterMe.getNodeCpuAndMemory({ hostname })).data)));
        await database.addNodeCpuAndMemory({ hostList, dataList, time });
    },
    async getNodeThroughputAndIops() {
        let time = new Date().getTime();
        let nodeList = await database.getSetting({ key: config.setting.nodeList });
        let hostList = await Promise.all(nodeList.map(async node => (await promise.runCommandInRemoteNodeInPromise(node, 'hostname'))));
        let dataList = await Promise.all(hostList.map(async hostname => {
            let { data: { throughput, iops } } = await afterMe.getNodeThroughputAndIops({ hostname });
            let throughputList = throughput.reverse().slice(0, 15);
            let iopsList = iops.reverse().slice(0, 15);
            let readThroughput = 0;
            let writeThroughput = 0;
            let totalIops = 0;
            if (throughputList.length && iopsList.length) {
                throughputList.forEach(item => {
                    readThroughput += item.read
                    writeThroughput += item.write;
                });
                iopsList.forEach(item => {
                    totalIops += item.total
                });
            }
            return { throughput: { read: readThroughput, write: writeThroughput }, iops: totalIops };
        }));
        await database.addNodeThroughputAndIops({ hostList, dataList, time });
    },
};
module.exports = model;