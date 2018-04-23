const config = require('../config');
const mongoose = require('mongoose');
const handler = require('./handler');
const database = config.database.name;
(async () => {
    try {
        config.env.name && config.env.init === 'true' && config.env.master === 'true' && await mongoose.connect(`mongodb://localhost/${database}`);
    } catch (error) {
        handler.error(23, error);
    }
})();
module.exports = mongoose;