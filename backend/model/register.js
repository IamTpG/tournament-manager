const mongoose = require('mongoose')

const register_schema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  personal_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  name_in_tournament: {
    type: String,
    required: true
  },
  tournament_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  register_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('register', register_schema);
