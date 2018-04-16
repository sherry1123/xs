const mongoose = require('../model');
module.exports = mongoose.model('nasexport',
    new mongoose.Schema({
        type: String,
        path: String
    })
);