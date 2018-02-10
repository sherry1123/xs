const os = require('os');
const Koa = require('koa');
const app = new Koa();
const CronJob = require('cron').CronJob;
const router = new require('koa-router')();
const middleware = require('../middleware');
const promise = require('../module/promise');
const bodyParser = require('koa-bodyparser');
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
    // let cmd = `echo $(iostat -d 1 2 |awk "/Device/{i++}i==2"|egrep "sd|nvme"|awk '{ total += $2 } END { print total }')`;
    let random = ~~(Math.random() * 1000 * 1000);
    let cmd = `echo ${random}`;
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
    return { iplist: ['127.0.0.1'], data: [{ cpu, iops, memory }] };
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
app.use(bodyParser());
app.use(middleware.initParam());
app.use(router.routes()).use(router.allowedMethods());
app.listen(3457);