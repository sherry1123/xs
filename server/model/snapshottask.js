const mongoose = require('../model');
module.exports = mongoose.model('snapshottask',
    new mongoose.Schema({
        name: String,
        createTime: Date,
        startTime: Date,
        interval: Number,
        deleteRound: Boolean,
        isRunning: Boolean
    })
);