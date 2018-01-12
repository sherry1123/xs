const config = require('../config');
const mongoose = require('mongoose');
const database = config.database.name;
mongoose.connect(`mongodb://localhost/${database}`);
module.exports = mongoose;