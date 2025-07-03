const mongoose = require('mongoose');

/**
 * Function to connect to database with connect string
 * @param {string} db_connect_string - database's connect string
 */
const connectDatabaseFunction = (db_connect_string) => {
    try {
        mongoose.connect(db_connect_string)
        .then(() => console.log('Database is successfully connected!'));
    } catch (error) {
        console.error('Database is failed to connect', error);
        process.exit(1);
    }
};

module.exports = connectDatabaseFunction;