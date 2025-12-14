import Joi from 'joi';
import Meal from '../models/Meal.js';

export const createMeal = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        date: Joi.date(),
        foodItems: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            quantity: Joi.string().required(),
            calories: Joi.number().required(),
            protein: Joi.number(),
            carbs: Joi.number(),
            fat: Joi.number()
        })).min(1).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { name, date, foodItems } = req.body;

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        foodItems.forEach(item => {
            totalCalories += item.calories || 0;
            totalProtein += item.protein || 0;
            totalCarbs += item.carbs || 0;
            totalFat += item.fat || 0;
        });

        const meal = await Meal.create({
            user: req.user._id,
            date,
            name,
            foodItems,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat
        });

        res.status(201).json(meal);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getMeals = async (req, res) => {
    try {
        const meals = await Meal.find({ user: req.user._id }).sort({ date: -1 });
        res.json(meals);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};
