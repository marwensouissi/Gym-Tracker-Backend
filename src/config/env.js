import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'GEMINI_API_KEY'
];

// Check for missing env vars in production
if (process.env.NODE_ENV === 'production') {
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-tracker',
    JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development'
};
