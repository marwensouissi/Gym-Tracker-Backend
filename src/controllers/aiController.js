import { generateWorkoutSuggestion, generateMealSuggestion, generateWeeklySummary } from '../services/aiService.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import UserProfile from '../models/UserProfile.js';

// Helper: Build comprehensive user profile
const buildUserProfile = async (user, includeStats = true) => {
    const profile = {
        name: user.name,
        email: user.email,
        memberSince: user.createdAt
    };

    // Get user's health profile
    const healthProfile = await UserProfile.findOne({ user: user._id });

    if (healthProfile) {
        profile.health = {
            age: healthProfile.age,
            gender: healthProfile.gender,
            height: healthProfile.height,
            currentWeight: healthProfile.currentWeight,
            weightUnit: healthProfile.weightUnit,
            bmi: healthProfile.calculateBMI(),
            targetWeight: healthProfile.targetWeight,
            medicalConditions: healthProfile.medicalConditions.map(c => c.condition),
            allergies: healthProfile.allergies,
            injuries: healthProfile.injuries.map(i => ({
                description: i.description,
                status: i.recoveryStatus
            })),
            fitnessGoals: healthProfile.fitnessGoals,
            activityLevel: healthProfile.activityLevel,
            dietaryRestrictions: healthProfile.dietaryRestrictions,
            experienceLevel: healthProfile.experienceLevel,
            workoutFrequency: healthProfile.workoutFrequency
        };

        // Add weight progress if available
        const weightProgress = healthProfile.getWeightProgress();
        if (weightProgress) {
            profile.health.weightProgress = weightProgress;
        }
    }

    if (includeStats) {
        // Get all-time workout stats
        const allWorkouts = await Workout.find({ user: user._id });
        const allMeals = await Meal.find({ user: user._id });

        profile.stats = {
            totalWorkouts: allWorkouts.length,
            totalMeals: allMeals.length,
            totalCaloriesBurned: allWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
            avgCaloriesPerWorkout: allWorkouts.length > 0
                ? Math.round(allWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / allWorkouts.length)
                : 0
        };

        // Workout type breakdown
        const cardioCount = allWorkouts.filter(w => w.type === 'cardio').length;
        const resistanceCount = allWorkouts.filter(w => w.type === 'resistance').length;

        profile.workoutPreferences = {
            cardio: cardioCount,
            resistance: resistanceCount,
            preference: cardioCount > resistanceCount ? 'cardio' : resistanceCount > cardioCount ? 'resistance' : 'balanced'
        };
    }

    return profile;
};

export const getWorkoutSuggestion = async (req, res) => {
    try {
        // Build comprehensive user profile
        const userProfile = await buildUserProfile(req.user, true);

        // Fetch last 5 workouts for pattern analysis
        const lastWorkouts = await Workout.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(5);

        const suggestion = await generateWorkoutSuggestion(userProfile, lastWorkouts);
        res.json({ suggestion });
    } catch (error) {
        console.error('Error generating workout suggestion:', error);
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
};

export const getMealSuggestion = async (req, res) => {
    try {
        // Build user profile with recent meal data
        const userProfile = await buildUserProfile(req.user, true);

        // Get recent meals for pattern analysis
        const recentMeals = await Meal.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(7);

        // Calculate average daily calories from recent meals
        const avgCalories = recentMeals.length > 0
            ? Math.round(recentMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0) / recentMeals.length)
            : 2000;

        // Get recent workouts to factor in activity level
        const recentWorkouts = await Workout.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(3);

        const avgCaloriesBurned = recentWorkouts.length > 0
            ? Math.round(recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / recentWorkouts.length)
            : 0;

        // Adjust target calories based on activity
        const targetCalories = avgCalories + (avgCaloriesBurned > 300 ? 200 : 0);

        // Add recent meal info to profile
        userProfile.recentMeals = recentMeals.length;
        userProfile.avgDailyCalories = avgCalories;
        userProfile.activityLevel = avgCaloriesBurned > 400 ? 'high' : avgCaloriesBurned > 200 ? 'moderate' : 'low';

        const suggestion = await generateMealSuggestion(userProfile, targetCalories);
        res.json({ suggestion });
    } catch (error) {
        console.error('Error generating meal suggestion:', error);
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
        }).sort({ date: 1 });

        const meals = await Meal.find({
            user: req.user._id,
            date: { $gte: oneWeekAgo }
        }).sort({ date: 1 });

        // Build comprehensive user profile for context
        const userProfile = await buildUserProfile(req.user, true);

        const summary = await generateWeeklySummary(workouts, meals, userProfile);
        res.json({ summary });
    } catch (error) {
        console.error('Error generating weekly summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
};
