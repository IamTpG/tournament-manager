const mongoose = require('mongoose')
const { REGISTRATION_STATUSES } = require('../constants/enums')

const register_schema = new mongoose.Schema({
  // Toàn bộ bracket định danh người chơi bằng trường này (match.players lưu
  // register.id), nên nó bắt buộc phải duy nhất.
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  personal_id: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true, // để chỉ mục duy nhất không coi A@x.com và a@x.com là hai người
    maxlength: 254
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  name_in_tournament: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  tournament_id: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: REGISTRATION_STATUSES,
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
