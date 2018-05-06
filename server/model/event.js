const mongoose = require('../module/mongoose');
module.exports = mongoose.model('event',
    new mongoose.Schema({
        channel: String,
        event: String,
        target: String,
        user: String,
        ip: String
    })
);