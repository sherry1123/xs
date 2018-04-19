const cluster = require('cluster');
const config = require('./server/config');
const status = require('./server/service/status');
const init = require('./server/service/initialize');
const snapshot = require('./server/service/snapshot');
const workerNameList = config.process.name;
const getWorkerFromConfig = (id, initStatus, isMaster) => ({ NAME: workerNameList[id], INIT_STATUS: initStatus, IS_MASTER: isMaster });
const getWorkerFromProcess = worker => ({ name: worker.process.env.NAME, initStatus: worker.process.env.INIT_STATUS, isMaster: worker.process.env.IS_MASTER });
const startNewWorker = id => {
	let { isMaster, initStatus } = cluster.settings;
	if ((!initStatus && id !== 3) || (initStatus && isMaster) || (initStatus && !isMaster && id !== 2)) {
		cluster.fork(getWorkerFromConfig(id, initStatus, isMaster));
		cluster.workers[id].on('message', clusterMessageHandler);
		cluster.workers[id].on('exit', cluster.fork.bind(this, getWorkerFromConfig(id, initStatus, isMaster)));
	}
};
const clusterSendMessageToAllWorker = msg => {
	for (let id in cluster.workers) {
		cluster.workers[id].send(msg);
	}
};
const clusterMessageHandler = msg => {
	switch (msg) {
		case 'agentd ready':
			startNewWorker(2);
			break;
		case 'job ready':
			startNewWorker(3);
			break;
		case 'task ready':
			break;
		default:
			clusterSendMessageToAllWorker(msg);
			break;
	}
};
const workerMessageHandler = msg => {
	switch (msg) {
		case 'rollback start':
			snapshot.setRollbackStatus(true);
			break;
		case 'rollback end':
			snapshot.setRollbackStatus(false);
			break;
	}
};
(async () => {
	if (cluster.isMaster) {
		cluster.settings.initStatus = await status.getInitStatus();
		cluster.settings.isMaster = await status.isMaster();
		startNewWorker(1);
	} else {
		let { name, initStatus } = getWorkerFromProcess(cluster.worker);
		initStatus = initStatus === 'true' ? true : false;
		init.setInitStatus(initStatus);
		switch (name) {
			case 'agentd':
				require('./server/agentd/');
				process.on('message', workerMessageHandler);
				process.send('agentd ready');
				break;
			case 'job':
				require('./server/');
				process.on('message', workerMessageHandler);
				process.send('job ready');
				break;
			case 'task':
				require('./server/schedule/');
				process.on('message', workerMessageHandler);
				process.send('task ready');
				break;
		}
	}
})();