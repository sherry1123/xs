const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/storage');
module.exports = mongoose;