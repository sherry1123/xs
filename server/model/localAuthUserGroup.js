const mongoose = require('../module/mongoose');
module.exports = mongoose.model('localauthusergroup',
    new mongoose.Schema({
        name: String,
        description: String
    })
);