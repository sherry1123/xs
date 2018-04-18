const mongoose = require('../model');
module.exports = mongoose.model('nasexport',
    new mongoose.Schema({
        path: String,
        protocol: String,
        description: String
    })
);