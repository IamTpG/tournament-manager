
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    full_name :String,
    phone : String,
    ID : String,
    email : String,
    nick_name: String,
    tournament: String, //tournamentID
    status : {type: String, default : 'pending', enum:['pending','approved','denied']}
});


module.exports = mongoose.model('Player', playerSchema);