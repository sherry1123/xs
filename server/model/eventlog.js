const mongoose = require('../model');
module.exports = mongoose.model('eventlog',
    new mongoose.Schema({
        time: Date,
        node: String,
        desc: String,
        level: Number,
        source: String,
        read: Boolean
    })
);