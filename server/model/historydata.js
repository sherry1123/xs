const mongoose = require('../model');
module.exports = mongoose.model('historydata',
    new mongoose.Schema({
        date: Date,
        iplist: Array,
        data: Array
    })
);