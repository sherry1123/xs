const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/song', {useMongoClient: true});

exports.connectMongoDB = mongoose;