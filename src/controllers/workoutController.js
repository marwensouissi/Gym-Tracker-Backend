import Joi from 'joi';
import Workout from '../models/Workout.js';
import { calculateCalories } from '../services/calorieService.js';

export const createWorkout = async (req, res) => {
    const schema = Joi.object({
        type: Joi.string().valid('cardio', 'resistance').required(),
        date: Joi.date(),
        exercises: Joi.array().items(Joi.object({
            name: Joi.string(),
            sets: Joi.number(),
            reps: Joi.number(),
            weight: Joi.number(),
            duration: Joi.number(),
            distance: Joi.number()
        })),
        duration: Joi.number().min(0), // optional for resistance, required for cardio
        notes: Joi.string()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { type, exercises, duration, date, notes } = req.body;

        // Calculate calories
        // In a real app, user weight should come from User profile
        const caloriesBurned = calculateCalories({ type, exercises, duration, name: type === 'cardio' ? exercises?.[0]?.name : '' }, 75); // defaulting 75kg for now

        const workout = await Workout.create({
            user: req.user._id,
            type,
            exercises,
            date,
            duration,
            caloriesBurned,
            notes
        });

        res.status(201).json(workout);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 });
        res.json(workouts);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};
