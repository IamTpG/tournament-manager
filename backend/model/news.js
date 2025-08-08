const mongoose = require('mongoose')

const news_schema = new mongoose.Schema({
    image: String,
    title: String,
    content: String,
    link: String,
    published_day: {
        type: Date,
        default: Date.now
    } 
});

module.exports = mongoose.model('news', news_schema);