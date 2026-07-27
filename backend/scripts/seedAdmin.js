require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabaseFunction = require('../config/database');
const account = require('../model/admin_account');

const [, , username, password] = process.argv;

if (!username || !password) {
    console.error('Usage: node scripts/seedAdmin.js <username> <password>');
    process.exit(1);
}

connectDatabaseFunction(process.env.DATABASE_URL);

mongoose.connection.once('open', async () => {
    try {
        const existing = await account.findOne({ username });
        if (existing) {
            existing.password = password;
            await existing.save(); // triggers pre('save') hashing hook
            console.log(`Updated password for existing admin "${username}"`);
        } else {
            await account.create({ username, password }); // triggers pre('save') hashing hook
            console.log(`Created admin account "${username}"`);
        }
    } catch (err) {
        console.error('Failed to seed admin account:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
});

mongoose.connection.once('error', (err) => {
    console.error('Database connection error:', err);
    process.exit(1);
});
