const mongoose = require('../model');
module.exports = mongoose.model('auditlog',
    new mongoose.Schema({
        time: Date,
        user: String,
        type: String,
        desc: String,
        level: Number,
        ip: String
    })
);