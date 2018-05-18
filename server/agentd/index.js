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
//hardware
let cpu = getCpuUsage();
let memory = getMemoryUsage();
//schedule
new cron.CronJob('*/15 * * * * *', () => {
    cpu = getCpuUsage(cpu);
    memory = getMemoryUsage();
}, null, true);
//controller
const getAll = ctx => {
    ctx.body = { cpu, memory };
};
//router
router.all('/hardware/getall', getAll);
//app
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3457);