const cluster = require('cluster');
const logger = require('./server/module/logger');
const startNewAgent = () => {
	cluster.fork({ name: 'agent' });
	cluster.workers[1].on('message', messageHandler);
	cluster.workers[1].on('exit', () => cluster.fork({ name: 'agent' }));
}
const startNewWorker = () => {
	cluster.fork({ name: 'worker' });
	cluster.workers[2].on('message', messageHandler);
	cluster.workers[2].on('exit', () => cluster.fork({ name: 'worker' }));
}
const getWorkerName = (worker) => {
	return worker.process.env.name;
}
const messageHandler = (msg) => {
	switch (msg) {
		case 'agent ready':
			startNewWorker();
			break;
		case 'worker ready':
			logger.info('all ready');
			break;
		default:
			logger.info(msg);
	}
}
if (cluster.isMaster) {
	logger.info('master ready');
	startNewAgent();
} else if (getWorkerName(cluster.worker) === 'agent') {
	require('./server/agent/index');
	logger.info('agent ready');
	process.send('agent ready');
} else {
	require('./server/index');
	logger.info('worker ready');
	process.send('worker ready');
}