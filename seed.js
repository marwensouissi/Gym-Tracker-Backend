import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Workout from './src/models/Workout.js';
import Meal from './src/models/Meal.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-tracker');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Workout.deleteMany({});
        await Meal.deleteMany({});
        console.log('Cleared existing data');

        // Create sample user
        const user = await User.create({
            name: 'Demo User',
            email: 'demo@fitness.com',
            password: 'demo1234'
        });
        console.log('Created user:', user.email);

        // Create sample workouts
        const workouts = await Workout.insertMany([
            {
                user: user._id,
                type: 'resistance',
                exercises: [
                    { name: 'Bench Press', sets: 3, reps: 10, weight: 60 },
                    { name: 'Squats', sets: 3, reps: 12, weight: 80 },
                    { name: 'Deadlifts', sets: 3, reps: 8, weight: 100 }
                ],
                caloriesBurned: 250,
                notes: 'Great strength session',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                user: user._id,
                type: 'cardio',
                exercises: [
                    { name: 'Running', duration: 30, distance: 5 }
                ],
                duration: 30,
                caloriesBurned: 300,
                notes: 'Morning run',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            }
        ]);
        console.log(`Created ${workouts.length} workouts`);

        // Create sample meals
        const meals = await Meal.insertMany([
            {
                user: user._id,
                name: 'Breakfast',
                foodItems: [
                    { name: 'Oatmeal', quantity: '100g', calories: 150, protein: 5, carbs: 27, fat: 3 },
                    { name: 'Banana', quantity: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
                    { name: 'Almonds', quantity: '30g', calories: 170, protein: 6, carbs: 6, fat: 15 }
                ],
                totalCalories: 425,
                totalProtein: 12,
                totalCarbs: 60,
                totalFat: 18,
                date: new Date()
            },
            {
                user: user._id,
                name: 'Lunch',
                foodItems: [
                    { name: 'Chicken Breast', quantity: '150g', calories: 250, protein: 45, carbs: 0, fat: 5 },
                    { name: 'Brown Rice', quantity: '200g', calories: 220, protein: 5, carbs: 45, fat: 2 },
                    { name: 'Broccoli', quantity: '100g', calories: 35, protein: 3, carbs: 7, fat: 0 }
                ],
                totalCalories: 505,
                totalProtein: 53,
                totalCarbs: 52,
                totalFat: 7,
                date: new Date()
            }
        ]);
        console.log(`Created ${meals.length} meals`);

        console.log('\n✅ Seed data created successfully!');
        console.log('\nDemo User Credentials:');
        console.log('Email: demo@fitness.com');
        console.log('Password: demo1234');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
