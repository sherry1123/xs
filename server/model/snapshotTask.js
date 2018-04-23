const mongoose = require('../module/mongoose');
module.exports = mongoose.model('snapshottask',
    new mongoose.Schema({
        name: String,
        createTime: Date,
        startTime: Date,
        autoDisableTime: Number,
        interval: Number,
        deleteRound: Boolean,
        description: String,
        isRunning: Boolean
    })
);