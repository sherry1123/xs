const mongoose = require('../module/mongoose');
module.exports = mongoose.model('setting',
    new mongoose.Schema({
        key: String,
        value: String
    })
);