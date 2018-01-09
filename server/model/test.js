const mongoose = require('../config/database');
const Schema = mongoose.Schema;
const test = new Schema({
    id: Number,
    text: String
});
module.exports = mongoose.model('test', test);