const mongoose = require('../module/mongoose');
module.exports = mongoose.model('localauthuser',
    new mongoose.Schema({
        name: String,
        password: String,
        primaryGroup: String,
        secondaryGroup: String,
        description: String
    })
);