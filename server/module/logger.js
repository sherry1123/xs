const log4js = require('log4js');
const config = require('../config');

log4js.configure({
	appenders: {
		console: { 
			type: 'console'
		},
		file: {
			type: 'file',
			filename: `${config.env.root}/log/log4js.log`,
			maxLogSize: 1024 * 1024 * 10,
			backups: 3
		}
	},
	categories: {
		default: { appenders: ['console', 'file'], level: 'info' },
	},
	disableClustering: true
});
const logger = log4js.getLogger('console');

module.exports = logger;