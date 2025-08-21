// const mongoose = require('mongoose');

// const match_schema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true,
//     unique: true // đảm bảo không trùng
//   },
//   tournament_ID: {
//     type: String,
//     required: true
//   },
//   format: String,
//   players: [String], // Danh sách ID người chơi
//   results: [
//     {
//       player: String, // cũng là ID người chơi
//       score: {
//         type: Number,
//         default: 0
//       }
//     }
//   ],
//   occurence_day: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('match', match_schema);

const mongoose = require('mongoose');

const match_schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true // Đảm bảo không trùng lặp
  },
  tournament_ID: {
    type: String,
    required: true
  },
  format: String,
  players: [String], // Danh sách ID người chơi
  results: [
    {
      player: String, // ID người chơi
      score: {
        type: Number,
        default: 0
      }
    }
  ],
  occurence_day: {
    type: Date,
    default: Date.now
  },
  round: {
    type: Number,
    required: true,
    default: 1 // Vòng đấu của match (ví dụ: vòng 1, vòng 2, bán kết, chung kết)
  },
  status: {
    type: String,
    enum: ['pending', 'ongoing', 'completed', 'cancelled'], // Trạng thái của match
    default: 'pending' // Mặc định là 'pending' (chưa diễn ra)
  },
  bracket_type: {
    type: String,
    enum: ['winners', 'losers', 'grand_finals'], // Nhánh thắng, nhánh thua, chung kết tổng
    required: true,
    default: 'winners' // Mặc định các trận vòng đầu tiên thuộc nhánh thắng
  }
});

module.exports = mongoose.model('match', match_schema);
