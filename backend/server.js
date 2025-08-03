require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const user_routes = require('./routes/userRoutes');
const admin_routes = require('./routes/adminRoutes');
const auth_routes = require('./routes/authRoutes')

const connectDatabaseFunction = require('./config/database');

const app = express();
app.use(express.json()); // Allow web to understand JSON data

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use('/api', user_routes);
app.use('/api/admin', admin_routes);
app.use('/api/auth', auth_routes);

const PORT = 5000;

const startServer = async () => {
    try {
        await connectDatabaseFunction('mongodb+srv://phmkhoi:cUB32mEFueveUK8V@tournament.lpysyp1.mongodb.net/');

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