const mongoose = require('mongoose')

const article_schema = new mongoose.Schema({
    image: String,
    title: String,
    content: String,
    link: String,
    published_day: {
        type: Date,
        default: Date.now
    } 
});

module.exports = mongoose.model('article', article_schema);