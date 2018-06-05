const mongoose = require('../module/mongoose');
module.exports = mongoose.model('nasserver',
    new mongoose.Schema({
        ip: String,
        path: String
    })
);