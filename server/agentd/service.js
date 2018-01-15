const os = require('os');
const CronJob = require('cron').CronJob;
const getCpuInfo = () => {
    let cpus = os.cpus();
    let current = ['user', 'sys'];
    let total = 0;
    let usage = 0;
    let core = cpus.length;
    cpus.forEach(cpu => {
        let { times } = cpu;
        for (let i of Object.keys(times)) {
            total += times[i];
            usage += current.includes(i) ? times[i] : 0;
        }
    });
    return { core, total, usage };
};
const getMemoryInfo = () => {
    let total = os.totalmem();
    let free = os.freemem();
    let usage = (1 - free / total) * 100;
    return { total, free, usage };
};
let CPU = getCpuInfo();
let _core = CPU.core;
let _total = CPU.total;
let _usage = CPU.usage;
let CPUUSAGE = 0;
new CronJob('*/15 * * * * *', () => {
    let cpu = getCpuInfo();
    let used = (cpu.usage - _usage) / (cpu.total - _total);
    _total = cpu.total;
    _usage = cpu.usage;
    CPUUSAGE = used * 100;
}, null, true);
let MEMORY = getMemoryInfo();
exports.getCpuUsage = () => {
    return { core: _core, usage: CPUUSAGE }
};
exports.getMemoryUsage = () => {
    return MEMORY;
};
