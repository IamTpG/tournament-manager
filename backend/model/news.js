const mongoose = require('mongoose')

const news_schema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10000
    },
    link: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    // required đi cùng default: getAllNews gọi `published_day.toLocaleDateString()`
    // mà không kiểm tra null, nên chỉ một bản ghi null là cả danh sách tin tức 500.
    published_day: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('news', news_schema);
