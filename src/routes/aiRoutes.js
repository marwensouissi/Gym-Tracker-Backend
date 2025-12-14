import express from 'express';
import { getWorkoutSuggestion, getMealSuggestion, getWeeklySummary } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';

const router = express.Router();

// Apply rate limiting to all AI routes (10 requests per minute per user)
router.use(protect);
router.use(aiRateLimiter({ maxRequests: 10, windowMs: 60000 }));

router.get('/workout-suggestion', getWorkoutSuggestion);
router.get('/meal-suggestion', getMealSuggestion);
router.get('/weekly-summary', getWeeklySummary);

export default router;
