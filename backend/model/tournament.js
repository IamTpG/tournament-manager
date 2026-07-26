const mongoose = require('mongoose')
const { TOURNAMENT_FORMATS, MIN_PARTICIPANTS, MAX_PARTICIPANTS } = require('../constants/enums')

const tournament_schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },
    image: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    // game và title được bracket engine đọc trực tiếp (matchControllers gọi
    // `tournament.game.toLowerCase()`), nên thiếu chúng sẽ gây crash 500.
    game: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    // format quyết định toàn bộ luồng sinh bracket — phải là tập đóng, không
    // được là chuỗi tự do như trước.
    format: {
        type: String,
        required: true,
        enum: TOURNAMENT_FORMATS
    },
    description: {
        type: String,
        trim: true,
        maxlength: 5000
    },
    participants: {
        type: Number,
        required: true,
        min: MIN_PARTICIPANTS,
        max: MAX_PARTICIPANTS,
        validate: {
            validator: Number.isInteger,
            message: 'Số người tham gia phải là số nguyên'
        }
    },
    // required cùng với default: chặn việc set thẳng null qua update (trước đây
    // một bản ghi có start_date null làm GET /tournament 500 cho TOÀN BỘ danh sách).
    start_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    end_date: {
        type: Date,
        required: true,
        default: function () {
            const one_month_later = new Date();
            one_month_later.setMonth(one_month_later.getMonth() + 1);
            return one_month_later;
        }
    }
});

module.exports = mongoose.model('tournament', tournament_schema)