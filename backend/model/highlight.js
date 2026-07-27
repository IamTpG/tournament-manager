const mongoose = require('mongoose')

const highlight_schema = new mongoose.Schema({
    // Tên trường viết hoa để khớp với HighlightCard.jsx và các controller sẵn có.
    URL: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
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
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    }
});

module.exports = mongoose.model('highlight', highlight_schema);
