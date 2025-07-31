const mongoose = require('mongoose');

const match_schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true // đảm bảo không trùng
  },
  tournament_ID: {
    type: String,
    required: true
  },
  format: String,
  players: [String], // Danh sách ID người chơi
  results: [
    {
      player: String, // cũng là ID người chơi
      score: {
        type: Number,
        default: 0
      }
    }
  ],
  occurence_day: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('match', match_schema);
