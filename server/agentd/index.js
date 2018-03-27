const os = require('os');
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const CronJob = require('cron').CronJob;
const promise = require('../module/promise');
const fileSystem = require('../service/filesystem');
//service
const getCpuInfo = () => {
    let cpus = os.cpus();
    let current = ['user', 'sys'];
    let total = used = usage = 0;
    let core = cpus.length;
    cpus.forEach(cpu => {
        let { times } = cpu;
        for (let i of Object.keys(times)) {
            total += times[i];
            used += current.includes(i) ? times[i] : 0;
        }
    });
    return { core, total, used, usage };
};
const getCpuUsage = () => {
    let cpu = getCpuInfo();
    let usage = (cpu.used - CPU.used) / (cpu.total - CPU.total) * 100;
    CPU.total = cpu.total, CPU.used = cpu.used, CPU.usage = usage;
};
const getIopsUsage = async () => {
    let cmd = `echo $(iostat -d 1 2 |awk "/Device/{i++}i==2"|egrep "sd|nvme"|awk '{ total += $2 } END { print total }')`;
    IOPS.used = Number(String(await promise.runCommandInPromise(cmd)).replace('\n', ''));
};
const getMemoryUsage = () => {
    let total = os.totalmem();
    let free = os.freemem();
    let usage = (1 - free / total) * 100;
    return { total, free, usage };
};
let CPU = getCpuInfo();
let IOPS = { used: 0 };
const getHardware = () => {
    let cpu = CPU;
    let iops = IOPS;
    let memory = getMemoryUsage();
    return { cpu, iops, memory };
};
const metaNodesParam = {
    nodeType: 1,
    interval: 15,
    numLines: 15,
    dataSequenceID: 2,
    requestorID: 0,
    hosts: []
};
const getMetaNodesInfo = async () => {
    let date = new Date();
    let { nodeType, interval, numLines, dataSequenceID, requestorID } = metaNodesParam;
    let data = await fileSystem.getUserStats({ nodeType, interval, numLines, requestorID, nextDataSequenceID: dataSequenceID });
    if (!requestorID) {
        metaNodesParam.requestorID = data.requestorID;
    } else if (data.hosts) {
        data.sum.ip = 'sum';
        data.hosts.unshift(data.sum);
        metaNodesParam.dataSequenceID += 1;
        metaNodesParam.hosts = data.hosts;
    }
};
let knownProblems = [];
const getKnownProblemsInfo = async () => {
    let data = await fileSystem.getKnownProblems({});
    knownProblems = data;
};
getKnownProblemsInfo();
//schedule
new CronJob('*/1 * * * * *', async () => {
    await getMetaNodesInfo();
}, null, true);
new CronJob('*/15 * * * * *', () => {
    getCpuUsage();
    getIopsUsage();
}, null, true);
new CronJob('*/15 * * * * *', async () => {
    await getKnownProblemsInfo();
}, null, true);
//controller
const getAll = ctx => {
    ctx.body = getHardware();
};
const getMetaNodes = ctx => {
    ctx.body = metaNodesParam.hosts;
};
const getKnownProblems = ctx => {
    ctx.body = knownProblems;
}
//router
router.all('/hardware/getall', getAll);
router.all('/hardware/getmetanodes', getMetaNodes);
router.all('/hardware/getknownproblems', getKnownProblems);
//app
app.use(router.routes()).use(router.allowedMethods());
app.listen(3457);