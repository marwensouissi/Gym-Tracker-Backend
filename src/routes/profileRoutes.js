import express from 'express';
import { getProfile, updateProfile, updateWeight, getWeightHistory } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getProfile)
    .post(protect, updateProfile);

router.put('/weight', protect, updateWeight);
router.get('/weight-history', protect, getWeightHistory);

export default router;
