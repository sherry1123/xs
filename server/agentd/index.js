const os = require('os');
const Koa = require('koa');
const Router = require('koa-router');
const promise = require('../module/promise');
const app = new Koa();
const router = new Router();
//hardware
let CPU = {};
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
    usage = Math.round((Object.keys(CPU).length === 0 ? used / total : (used - CPU.used) / (total - CPU.total)) * 10000) / 100;
    CPU = { core, total, used, usage };
    return CPU;
};
const getMemoryUsage = () => {
    let total = os.totalmem();
    let free = os.freemem();
    let usage = Math.round((1 - free / total) * 10000) / 100;
    return { total, free, usage };
};
const getIOPSUsage = async () => {
    let cmd = `echo $(iostat -d 1 2 |awk "/Device/{i++}i==2"|egrep "sd|nvme"|awk '{ total += $2 } END { print total }')`;
    return { used: Number(await promise.runCommandInPromise(cmd)) };
};
//service
const getHardware = async () => {
    let result = {};
    try {
        let cpu = getCPUUsage();
        let memory = getMemoryUsage();
        let iops = await getIOPSUsage();
        result = { code: 0, data: { cpu, memory, iops } };
    } catch (error) {
        result = { code: 1, msg: error.message ? error.message : error };
    }
    return result;
};
//controller
const getAll = async ctx => {
    ctx.body = await getHardware();
};
//router
router.all('/hardware/getall', getAll);
//app
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3457);