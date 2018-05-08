const mongoose = require('../module/mongoose');
module.exports = mongoose.model('auditlog',
    new mongoose.Schema({
        time: Date,
        user: String,
        group: Object,
        desc: Object,
        level: Number,
        ip: String
    })
);