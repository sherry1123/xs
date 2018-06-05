const mongoose = require('../module/mongoose');
module.exports = mongoose.model('nodecpuandmemory',
    new mongoose.Schema({
        hostList: Array,
        dataList: [{
            cpu: Number,
            memory: Number
        }],
        time: Number
    })
);