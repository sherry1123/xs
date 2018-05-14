const mongoose = require('../module/mongoose');
module.exports = mongoose.model('localusergroup',
    new mongoose.Schema({
        name: String,
        description: String
    })
);