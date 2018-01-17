const mongoose = require('../model');
module.exports = mongoose.model('setting',
    new mongoose.Schema({
        key: String,
        value: String
    })
);