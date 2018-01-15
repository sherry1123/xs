const os = require('os');
const CronJob = require('cron').CronJob;
const getCpuInfo = () => {
    let cpus = os.cpus();
    let current = ['user', 'sys'];
    let total = 0;
    let used = 0;
    let usage = 0;
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
let CPU = getCpuInfo();
new CronJob('*/15 * * * * *', () => {
    let cpu = getCpuInfo();
    let usage = (cpu.used - CPU.used) / (cpu.total - CPU.total) * 100;
    CPU.total = cpu.total;
    CPU.used = cpu.used;
    CPU.usage = usage;
}, null, true);
exports.getCpuUsage = () => {
    return CPU;
};
exports.getMemoryUsage = () => {
    let total = os.totalmem();
    let free = os.freemem();
    let usage = (1 - free / total) * 100;
    return { total, free, usage };
};
