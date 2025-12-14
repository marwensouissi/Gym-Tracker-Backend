import express from 'express';
import { createWorkout, getWorkouts } from '../controllers/workoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createWorkout)
    .get(protect, getWorkouts);

export default router;
