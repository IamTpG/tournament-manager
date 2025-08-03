const mongoose = require('mongoose')

const register_schema = new mongoose.Schema({
    id: String,
    full_name: String,
    personal_id: String,
    phone: String,
    email: String,
    name_in_tournament: String,
    tournament: String, //tournamentID
    status: {type: String, default: 'pending', enum: ['pending','approved','denied']}  ,
    register_date: Date
});

module.exports = mongoose.model('register', register_schema)