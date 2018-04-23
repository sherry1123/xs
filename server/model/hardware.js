const mongoose = require('../module/mongoose');
module.exports = mongoose.model('hardware',
    new mongoose.Schema({
        date: Date,
        ipList: Array,
        data: Array
    })
);