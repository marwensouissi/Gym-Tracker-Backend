import { generateWorkoutSuggestion, generateMealSuggestion, generateWeeklySummary } from '../services/aiService.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';

export const getWorkoutSuggestion = async (req, res) => {
    try {
        // Fetch last 3 workouts for context
        const lastWorkouts = await Workout.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(3);

        const suggestion = await generateWorkoutSuggestion({ name: req.user.name }, lastWorkouts);
        res.json({ suggestion });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
};

export const getMealSuggestion = async (req, res) => {
    try {
        const suggestion = await generateMealSuggestion({ name: req.user.name }, 2000); // Default 2000 for now
        res.json({ suggestion });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
};

export const getWeeklySummary = async (req, res) => {
    try {
        // Get last 7 days data
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const workouts = await Workout.find({
            user: req.user._id,
            date: { $gte: oneWeekAgo }
        });

        const meals = await Meal.find({
            user: req.user._id,
            date: { $gte: oneWeekAgo }
        });

        const summary = await generateWeeklySummary(workouts, meals);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate summary' });
    }
};
