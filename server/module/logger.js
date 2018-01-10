const log4js = require('log4js');

log4js.configure({
	appenders: {
		out: { type: 'console' }
	},
	categories: {
		default: { appenders: ['out'], level: 'info' }
	},
	disableClustering: true
});
const logger = log4js.getLogger('console');

module.exports = logger;