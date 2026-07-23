const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const admin_schema = new mongoose.Schema({
    username: String,
    password: String
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
