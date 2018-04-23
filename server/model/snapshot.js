const mongoose = require('../module/mongoose');
module.exports = mongoose.model('snapshot',
    new mongoose.Schema({
        name: String,
        description: String,
        isAuto: Boolean,
        deleting: Boolean,
        rollbacking: Boolean,
        createTime: Date
    })
);