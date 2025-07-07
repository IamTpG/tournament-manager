const mongoose = require('mongoose')

const article_schema = new mongoose.Schema({
    
    title: String,
    content: String,
    game: String,
    published_day: {
        type: Date,
        default: Date.now
    } 
});

module.exports = mongoose.model('article', article_schema); 