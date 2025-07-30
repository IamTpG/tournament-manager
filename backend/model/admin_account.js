const mongoose = require('mongoose')

const admin_schema = new mongoose.Schema({
    username: String,
    password: String,
    role: {type: String, enum: ['admin'], default: 'admin'}
});

// Hash password before saving to DB
// admin_schema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next(); // Only hash if password is new or changed
  
//     try {
//         const salt = await bcrypt.genSalt(10); // You can change the salt rounds if needed
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (err) {
//         next(err);
//     }
// });

module.exports = mongoose.model('admin', admin_schema)