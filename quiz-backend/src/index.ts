import 'reflect-metadata';
import * as express from 'express';
import * as cors from 'cors';
import { AppDataSource } from './config/data-source';
import quizRoutes from './app/api/quizRoutes';
import { initializeWebSocketServer } from './app/ws/wsServer';

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// REST API Routes
app.use('/quizzes', quizRoutes);

const PORT = process.env.PORT || 8080;

// Initialize Database and Start Server
AppDataSource.initialize()
    .then(() => {
        console.log('Database connected.');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        // Initialize WebSocket Server
        initializeWebSocketServer();
    })
    .catch((error) => {
        console.error('Error during Data Source initialization', error);
    });
