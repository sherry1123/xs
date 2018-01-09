const cluster = require('cluster');
const init = require('./server/module/init');
const logger = require('./server/module/logger');
const workerNameList = ['master', 'agentd', 'job', 'task'];
const getWorkerNameFromConf = id => ({ name: workerNameList[id] });
const getWorkerNameFromProc = worker => (worker.process.env.name);
const startNewWorker = id => {
	let { init } = cluster.settings;
	if (id === 3 && !init) {
		logger.info('system not init, no more worker need to run');
	} else {
		cluster.fork(getWorkerNameFromConf(id));
		cluster.workers[id].on('message', messageHandler);
		cluster.workers[id].on('exit', cluster.fork.bind(this, getWorkerNameFromConf(id)));
	}
};
const messageHandler = (msg) => {
	switch (msg) {
		case 'agentd ready':
			startNewWorker(2);
			break;
		case 'job ready':
			startNewWorker(3);
			break;
		case 'task ready':
			logger.info('all ready');
			break;
		default:
			logger.info(msg);
	}
};
if (cluster.isMaster) {
	let initStatus = init.status.check();
	cluster.settings.init = initStatus;
	logger.info('master ready');
	startNewWorker(1);
} else {
	let workName = getWorkerNameFromProc(cluster.worker);
	switch (workName) {
		case 'agentd':
			require('./server/agentd/index');
			logger.info('agentd ready');
			process.send('agentd ready');
			break;
		case 'job':
			require('./server/index');
			logger.info('job ready');
			process.send('job ready');
			break;
		case 'task':
			require('./server/schedule/index');
			logger.info('task ready');
			process.send('task ready');
			break;
		default:
			logger.info('no more worker need to run');
	}
}