const mongoose = require('../model');
module.exports = mongoose.model('nasexport',
    new mongoose.Schema({
        protocol: String,
        path: String
    })
);