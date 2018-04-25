const os = require('os');
const Koa = require('koa');
const cron = require('cron');
const Router = require('koa-router');
const child = require('child_process');
const app = new Koa();
const router = new Router();
//hardware
let CPU = {};
let MEMORY = {};
let IOPS = {};
//service
const getCPUUsage = () => {
    let cpus = os.cpus();
    let core = cpus.length;
    let total = 0;
    let used = 0;
    let usage = 0;
    let current = ['user', 'sys'];
    cpus.forEach(cpu => {
        let { times } = cpu;
        for (let i of Object.keys(times)) {
            total += times[i];
            used += current.includes(i) ? times[i] : 0;
        }
    });
    usage = Math.round((Object.keys(CPU).length ? (used - CPU.used) / (total - CPU.total) : used / total) * 10000) / 100;
    CPU = { core, total, used, usage };
};
const getMemoryUsage = () => {
    let total = os.totalmem();
    let free = os.freemem();
    let usage = Math.round((1 - free / total) * 10000) / 100;
    MEMORY = { total, free, usage };
};
const getIOPSUsage = () => {
    let command = `echo $(iostat -d 1 2 |awk "/Device/{i++}i==2"|egrep "sd|nvme"|awk '{ total += $2 } END { print total }')`;
    child.exec(command, (error, stdout) => {
        IOPS = { used: error ? 0 : Number(String(stdout).trim()) };
    });
};
//hardware
getCPUUsage();
getMemoryUsage();
getIOPSUsage();
//schedule
new cron.CronJob('*/15 * * * * *', () => {
    getCPUUsage();
    getMemoryUsage();
    getIOPSUsage();
}, null, true);
//controller
const getAll = ctx => {
    ctx.body = { cpu: CPU, memory: MEMORY, iops: IOPS };
};
//router
router.all('/hardware/getall', getAll);
//app
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3457);