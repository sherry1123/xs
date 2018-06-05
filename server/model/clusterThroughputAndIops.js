const mongoose = require('../module/mongoose');
module.exports = mongoose.model('clusterthroughputandiops',
    new mongoose.Schema({
        throughput: Number,
        iops: Number,
        time: Number
    })
);