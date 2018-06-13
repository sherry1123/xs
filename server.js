const cluster = require('cluster');
const config = require('./server/config');
const status = require('./server/service/status');
const setNewWorker = (id, initialize, mgmt, master) => ({ NAME: config.process.name[id], INITIALIZE: initialize, MGMT: mgmt, MASTER: master, DEINITIALIZE: false, REINITIALIZE: false, ROLLBACK: false });
const startNewWorker = id => {
	let { initialize, mgmt, master } = cluster.settings;
	cluster.fork(setNewWorker(id, initialize, mgmt, master));
	cluster.workers[id].on('message', clusterMessageHandler);
	cluster.workers[id].on('exit', cluster.fork.bind(this, setNewWorker(id, initialize, mgmt, master)));
};
const clusterSendMessageToAllWorker = msg => {
	for (let id in cluster.workers) {
		cluster.workers[id].send(msg);
	}
};
const clusterMessageHandler = msg => {
	switch (msg) {
		case 'server ready':
			startNewWorker(2);
			break;
		case 'schedule ready':
			break;
		default:
			clusterSendMessageToAllWorker(msg);
			break;
	}
};
const workerMessageHandler = msg => {
	switch (msg) {
		case 'initialize successfully':
			status.setInitStatus(true);
			break;
		case 'de-initialize start':
			status.setDeinitStatus(true);
			break;
		case 'de-initialize end':
			status.setDeinitStatus(false);
			break;
		case 're-initialize start':
			status.setReinitStatus(true);
			break;
		case 're-initialize end':
			status.setReinitStatus(false);
			break;
		case 'rollback start':
			status.setRollbackStatus(true);
			break;
		case 'rollback end':
			status.setRollbackStatus(false);
			break;
		default:
			break;
	}
};
(async () => {
	if (cluster.isMaster) {
		cluster.settings = await status.checkAllStatus();
		cluster.settings.initialize === cluster.settings.mgmt && startNewWorker(1);
	} else {
		switch (config.env.name) {
			case 'server':
				require('./server/');
				process.on('message', workerMessageHandler);
				process.send('server ready');
				break;
			case 'schedule':
				require('./server/schedule/');
				process.on('message', workerMessageHandler);
				process.send('schedule ready');
				break;
			default:
				break;
		}
	}
})();