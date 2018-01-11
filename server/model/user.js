const mongoose = require('../config/database');
module.exports = mongoose.model('user', new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
    group: String,
    type: String,
    receivemail: Boolean,
    useravatar: Number
}));