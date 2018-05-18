const mongoose = require('../module/mongoose');
module.exports = mongoose.model('nfsshare',
    new mongoose.Schema({
        path: String,
        description: String,
        clientList: Array
    })
);