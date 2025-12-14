import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        app.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
