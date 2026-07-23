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
    required: true
  },
  email: {
    type: String,
    required: true
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

// Uniqueness is scoped per tournament, not global — the same person can
// register for multiple tournaments, just not twice for the same one.
register_schema.index({ tournament_id: 1, personal_id: 1 }, { unique: true });
register_schema.index({ tournament_id: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('register', register_schema);
