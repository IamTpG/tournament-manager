const mongoose = require('mongoose')

const tournament_schema = new mongoose.Schema({
    tournament_id: String,
    tournament_name: String,
    game_name: String,
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