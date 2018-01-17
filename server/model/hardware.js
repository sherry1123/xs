const mongoose = require('../model');
module.exports = mongoose.model('hardware',
    new mongoose.Schema({
        date: Date,
        iplist: Array,
        data: Array
    })
);