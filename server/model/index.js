const config = require('../config');
const mongoose = require('mongoose');
const database = config.database.name;
if(config.env.name && config.env.init === 'true') {
    mongoose.connect(`mongodb://localhost/${database}`);
}
module.exports = mongoose;