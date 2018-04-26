const os = require('os');
const Koa = require('koa');
const cron = require('cron');
const Router = require('koa-router');
const child = require('child_process');
const app = new Koa();
const router = new Router();
//service
const getCpuUsage = prev => {
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
    usage = Math.round((prev ? (used - prev.used) / (total - prev.total) : used / total) * 10000) / 100;
    return { core, total, used, usage };
};
const getMemoryUsage = () => {
    let total = os.totalmem();
    let free = os.freemem();
    let usage = Math.round((1 - free / total) * 10000) / 100;
    return { total, free, usage };
};
const getIopsUsage = () => {
    let command = `echo $(iostat -d 1 2 |awk "/Device/{i++}i==2"|egrep "sd|nvme"|awk '{ total += $2 } END { print total }')`;
    let used = Number(String(child.execSync(command)).trim());
    return { used };
};
//hardware
let cpu = getCpuUsage();
let memory = getMemoryUsage();
let iops = getIopsUsage();
//schedule
new cron.CronJob('*/15 * * * * *', () => {
    cpu = getCpuUsage(cpu);
    memory = getMemoryUsage();
    iops = getIopsUsage();
}, null, true);
//controller
const getAll = ctx => {
    ctx.body = { cpu, memory, iops };
};
//router
router.all('/hardware/getall', getAll);
//app
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3457);