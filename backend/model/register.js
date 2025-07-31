const mongoose = require('mongoose')

const register_schema = new mongoose.Schema({
    full_name :String,
    phone : String,
    id : String,
    email : String,
    name_in_tournament: String,
    tournament: String, //tournamentID
    status : {type: String, default : 'pending', enum:['pending','approved','denied']}  ,
    register_date : Date
});

module.exports = mongoose.model('register', register_schema)