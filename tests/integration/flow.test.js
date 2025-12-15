import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Workout from '../../src/models/Workout.js';
import Meal from '../../src/models/Meal.js';

describe('Integration Tests - Full User Flow', () => {
    let token;
    let userId;

    beforeAll(async () => {
        // Connect to test database
        const testDB = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-tracker-test';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDB);
        }
    });

    afterAll(async () => {
        // Cleanup
        await User.deleteMany({});
        await Workout.deleteMany({});
        await Meal.deleteMany({});
        await mongoose.disconnect();
    }, 10000);

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe('testuser@example.com');

        token = res.body.token;
        userId = res.body._id;
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should log a workout', async () => {
        const res = await request(app)
            .post('/api/workouts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 'cardio',
                duration: 30,
                exercises: [{ name: 'running', duration: 30 }],
                notes: 'Morning run'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('caloriesBurned');
        expect(res.body.type).toBe('cardio');
    });

    it('should get user workouts', async () => {
        const res = await request(app)
            .get('/api/workouts')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should log a meal', async () => {
        const res = await request(app)
            .post('/api/meals')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Breakfast',
                foodItems: [
                    { name: 'Oatmeal', quantity: '100g', calories: 150, protein: 5, carbs: 27, fat: 3 },
                    { name: 'Banana', quantity: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 }
                ]
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('totalCalories');
        expect(res.body.totalCalories).toBe(255);
    });

    it('should get AI workout suggestion', async () => {
        const res = await request(app)
            .post('/api/ai/workout-suggestion')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: 'Give me a quick workout tip' });

        // Skip if AI service is unavailable (no API key)
        if (res.statusCode === 503) {
            expect(res.body).toHaveProperty('error');
            return;
        }

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('suggestion');
    });

    it('should fail to access protected route without token', async () => {
        const res = await request(app)
            .get('/api/workouts');

        expect(res.statusCode).toBe(401);
    });
});
