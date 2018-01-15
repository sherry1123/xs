const os = require('os');
const CronJob = require('cron').CronJob;
const promise = require('../module/promise');
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
const getCpuUsage = () => {
    let cpu = getCpuInfo();
    let usage = (cpu.used - CPU.used) / (cpu.total - CPU.total) * 100;
    CPU.total = cpu.total;
    CPU.used = cpu.used;
    CPU.usage = usage;
};
const getIopsUsage = async () => {
    let cmd = `echo $(iostat -d 1 2 |awk "/Device/{i++}i==2"|egrep "sd|nvme"|awk '{ total += $2 } END { print total }')`;
    IOPS = await promise.runCommandInPromise(cmd);
}
let CPU = getCpuInfo();
let IOPS = 0;
new CronJob('*/15 * * * * *', () => {
    getCpuUsage();
    getIopsUsage();
}, null, true);
exports.getCpu = () => {
    return CPU;
};
exports.getMemory = () => {
    let total = os.totalmem();
    let free = os.freemem();
    let usage = (1 - free / total) * 100;
    return { total, free, usage };
};
exports.getIops = () => {
    return IOPS;
}
