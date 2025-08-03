const mongoose = require('mongoose')

const tournament_schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    game: String,
    title: String,
    format: String,
    description: String,
    participants: {
        type: Number,
        min: 2
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date,
        default: function () {
            const one_month_later = new Date();
            one_month_later.setMonth(one_month_later.getMonth() + 1);
            return one_month_later;
        }
    }
});

module.exports = mongoose.model('tournament', tournament_schema)