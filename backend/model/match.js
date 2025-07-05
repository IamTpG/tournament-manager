const mongoose = require('mongoose')

const match_schema = new mongoose.Schema({
    
    first_player: String,
    second_player: String,
    tournament_ID: String,
    occurence_day: {
        type: Date,
        default: Date.now
    } 
});

module.exports = mongoose.model('match', match_schema);