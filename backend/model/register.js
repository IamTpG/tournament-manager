const mongoose = require('mongoose')

const registration_form_schema = new mongoose.Schema({
    tournament_id: String,
    full_name: String,
    phone_number: String,
    personal_id: String,
    email: String,
    name_in_tournament: String,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'denied'],
        default: 'pending'
    },
    registered_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('register', registration_form_schema)