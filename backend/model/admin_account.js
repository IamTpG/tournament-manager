const mongoose = require('mongoose')

const admin_schema = new mongoose.Schema({
    username: String,
    password: String
});

module.exports = mongoose.model('admin', admin_schema)
