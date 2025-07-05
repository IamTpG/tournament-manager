const express = require('express');
const mongoose = require('mongoose');

const user_routes = require('./routes/userRoutes');
const admin_routes = require('./routes/adminRoutes');

const connectDatabaseFunction = require('./config/database');

const app = express();
app.use(express.json()); // Allow web to understand JSON data

app.use('/api', user_routes);
app.use('/api/admin', admin_routes);

const PORT = 3000;

const startServer = async () => {
    try {
        await connectDatabaseFunction('mongodb://localhost:27017/tournament_managing');

        const server = app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });

        // Handel interrupt
        process.on('SIGINT', async () => {
            console.log('\nInterrupting Signal');

            await mongoose.connection.close();
            console.log('Database closed');

            server.close(() => {
                console.log('Server shut down');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Failed to start server: ', error);
    }
};

startServer()