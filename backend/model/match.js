const mongoose = require('mongoose')

const match_schema = new mongoose.Schema({
    

    //result_list :String
    first_player: String,
    second_player: String,
    // player list -> dua string vao tu tach thanh mang dong ?
    tournament_ID: String,
    occurence_day: {
        type: Date,
        default: Date.now
    } 
});

module.exports = mongoose.model('match', match_schema);