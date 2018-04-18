const os = require('os');
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const CronJob = require('cron').CronJob;
const promise = require('../module/promise');
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
    IOPS.used = Number(await promise.runCommandInPromise(cmd));
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
//schedule
new CronJob('*/15 * * * * *', () => {
    getCpuUsage();
    getIopsUsage();
}, null, true);
//controller
const getAll = ctx => {
    ctx.body = getHardware();
};
//router
router.all('/hardware/getall', getAll);
//app
app.use(router.routes()).use(router.allowedMethods());
app.listen(3457);