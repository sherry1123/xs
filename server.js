const cluster = require('cluster');
const config = require('./server/config');
const service = require('./server/service');
const logger = require('./server/module/logger');
const init = require('./server/service/initialize');
const workerNameList = config.process.name;
const getWorkerFromConfig = (id, initStatus) => ({ name: workerNameList[id], initStatus });
const getWorkerFromProcess = worker => ({ name: worker.process.env.name, initStatus: worker.process.env.initStatus });
const startNewWorker = id => {
	let { isMaster, initStatus } = cluster.settings;
	if (!initStatus && id === 3) {
		logger.info('system not init, no more worker need to run');
	} else if (!isMaster && initStatus && id === 2) {
		logger.info('node not master, no more worker need to run');
	} else {
		cluster.fork(getWorkerFromConfig(id, initStatus));
		cluster.workers[id].on('message', messageHandler);
		cluster.workers[id].on('exit', cluster.fork.bind(this, getWorkerFromConfig(id, initStatus)));
	}
};
const messageHandler = msg => {
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
(async () => {
	if (cluster.isMaster) {
		cluster.settings.isMaster = await service.isMaster();
		cluster.settings.initStatus = await service.getInitStatus();
		logger.info('master ready');
		startNewWorker(1);
	} else {
		let { name, initStatus } = getWorkerFromProcess(cluster.worker);
		switch (name) {
			case 'agentd':
				require('./server/agentd/index');
				init.setInitStatus(initStatus);
				logger.info('agentd ready');
				process.send('agentd ready');
				break;
			case 'job':
				require('./server/index');
				init.setInitStatus(initStatus);
				logger.info('job ready');
				process.send('job ready');
				break;
			case 'task':
				require('./server/schedule/index');
				init.setInitStatus(initStatus);
				logger.info('task ready');
				process.send('task ready');
				break;
			default:
				logger.info('no more worker need to run');
		}
	}
})();