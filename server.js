const cluster = require('cluster');
const logger = require('./server/module/logger');
const workerNameList = ['master', 'agent', 'job', 'task'];
const getWorkerNameFromConf = id => ({ name: workerNameList[id] });
const getWorkerNameFromProc = worker => (worker.process.env.name);
const startNewWorker = id => {
	cluster.fork(getWorkerNameFromConf(id));
	cluster.workers[id].on('message', messageHandler);
	cluster.workers[id].on('exit', cluster.fork.bind(this, getWorkerNameFromConf(id)));
};
const messageHandler = (msg) => {
	switch (msg) {
		case 'agent ready':
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
	logger.info('master ready');
	startNewWorker(1);
} else {
	let workerName = getWorkerNameFromProc(cluster.worker);
	switch (workerName) {
		case 'agent':
			require('./server/agent/index');
			logger.info('agent ready');
			process.send('agent ready');
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
			logger.info('no worker need to run');
	}
}