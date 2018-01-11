const mongoose = require('../config/database');
module.exports = mongoose.model('test', new mongoose.Schema({
    id: Number,
    text: String
}));