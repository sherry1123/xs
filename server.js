const cluster = require('cluster');
const config = require('./server/config');
const service = require('./server/service');
const logger = require('./server/module/logger');
const init = require('./server/service/initialize');
const workerNameList = config.process.name;
const getWorkerFromConfig = (id, initStatus) => ({ NAME: workerNameList[id], INIT_STATUS: initStatus });
const getWorkerFromProgress = worker => ({ name: worker.process.env.NAME, initStatus: worker.process.env.INIT_STATUS });
const startNewWorker = id => {
	let { isMaster, initStatus } = cluster.settings;
	if ((!initStatus && id !== 3) || (initStatus && isMaster) || (initStatus && !isMaster && id !== 2)) {
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
			break;
	}
};
(async () => {
	if (cluster.isMaster) {
		cluster.settings.initStatus = await service.getInitStatus();
		cluster.settings.isMaster = await service.isMaster();
		startNewWorker(1);
	} else {
		let { name, initStatus } = getWorkerFromProgress(cluster.worker);
		initStatus = initStatus === 'true' ? true : false;
		init.setInitStatus(initStatus);
		switch (name) {
			case 'agentd':
				require('./server/agentd/');
				process.send('agentd ready');
				break;
			case 'job':
				require('./server/');
				process.send('job ready');
				break;
			case 'task':
				require('./server/schedule/');
				process.send('task ready');
				break;
		}
	}
})();