const log4js = require('log4js');
const config = require('../config');

log4js.configure({
	appenders: {
		console: { type: 'console' },
		file: {
			type: 'file',
			filename: config.logs.path,
			maxLogSize: config.logs.maxSize,
			backups: config.logs.backup
		}
	},
	categories: {
		default: { appenders: ['console', 'file'], level: 'info' },
	},
	disableClustering: true
});
const logger = log4js.getLogger('console');

module.exports = logger;