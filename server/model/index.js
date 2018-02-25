const config = require('../config');
const mongoose = require('mongoose');
const logger = require('../module/logger');
const database = config.database.name;
(async () => {
    if (config.env.name && config.env.init === 'true') {
        try {
            await mongoose.connect(`mongodb://localhost/${database}`);
        } catch (error) {
            logger.error(`connect to mongodb error, message: ${error}`);
        }
    }
})();
module.exports = mongoose;