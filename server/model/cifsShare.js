const mongoose = require('../module/mongoose');
module.exports = mongoose.model('cifsshare',
    new mongoose.Schema({
        path: String,
        name: String,
        description: String,
        oplock: Boolean,
        notify: Boolean,
        offlineCacheMode: Number,
        userOrGroupList: Array
    })
);