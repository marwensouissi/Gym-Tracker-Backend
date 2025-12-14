import express from 'express';
import { createMeal, getMeals } from '../controllers/mealController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createMeal)
    .get(protect, getMeals);

export default router;
