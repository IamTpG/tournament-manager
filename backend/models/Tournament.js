const mongoose = require('mongoose')

const tournamentSchema = new mongoose.Schema ( {
    tour_ID :String,
    tour_name:String,   
    start_date :Date,
    end_date: Date,
    game : String
});


module.exports = mongoose.model('Tournament', tournamentSchema);