import express from 'express';
import { getWorkoutSuggestion, getMealSuggestion, getWeeklySummary } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';

const router = express.Router();

// Apply rate limiting to all AI routes (10 requests per minute per user)
router.use(protect);
router.use(aiRateLimiter({ maxRequests: 10, windowMs: 60000 }));

router.post('/workout-suggestion', getWorkoutSuggestion);
router.post('/meal-suggestion', getMealSuggestion);
router.post('/weekly-summary', getWeeklySummary);

export default router;
