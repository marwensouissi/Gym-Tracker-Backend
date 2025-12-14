import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger.js';
// We will import routes later
import "dotenv/config";

import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


console.log("GEMINI:", process.env.GEMINI_API_KEY);
console.log("GEMINI:", process.env.GEMINI_API_KEY);
console.log("GEMINI:", process.env.GEMINI_API_KEY);
console.log("GEMINI:", process.env.GEMINI_API_KEY);
console.log("GEMINI:", process.env.GEMINI_API_KEY);


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = YAML.load(join(__dirname, '../swagger.yaml'));

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error'
        }
    });
});

export default app;
