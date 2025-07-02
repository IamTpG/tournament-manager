const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({
    
    player1: String,
    player2: String,
    tournament_ID:String,
    occurence_day:Date 
});

module.exports = mongoose.model('Match', matchSchema);