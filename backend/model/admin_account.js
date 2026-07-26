const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const admin_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // trước đây có thể tạo hai admin trùng tên đăng nhập
        trim: true,
        maxlength: 100
    },
    password: {
        type: String,
        required: true
    }
});

// Only fires on .save()/.create() (document middleware) — updating password
// via findOneAndUpdate/updateOne would bypass this and store it in plaintext.
admin_schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('admin', admin_schema)
