const mongoose = require('../module/mongoose');
module.exports = mongoose.model('nodethroughputandiops',
    new mongoose.Schema({
        hostList: Array,
        dataList: [{
            throughput: {
                read: Number,
                write: Number
            },
            iops: Number,
        }],
        time: Number
    })
);