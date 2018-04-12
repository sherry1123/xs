const mongoose = require('../model');
module.exports = mongoose.model('snapshot',
    new mongoose.Schema({
        name: String,
        isAuto: Boolean,
        deleting: Boolean,
        rollbacking: Boolean,
        createTime: Date
    })
);