const mongoose = require('mongoose')

const highlight_schema = new mongoose.Schema({
    URL : String,
    image: String,
    title: String,
    description : String,
});

module.exports = mongoose.model('highlight', highlight_schema);   