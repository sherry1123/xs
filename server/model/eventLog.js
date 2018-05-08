const mongoose = require('../module/mongoose');
module.exports = mongoose.model('eventlog',
    new mongoose.Schema({
        time: Date,
        node: String,
        desc: Object,
        level: Number,
        source: String,
        read: Boolean
    })
);