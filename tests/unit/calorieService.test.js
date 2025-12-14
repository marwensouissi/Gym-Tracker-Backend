import { calculateCalories } from '../../src/services/calorieService.js';

describe('Calorie Service', () => {
    describe('calculateCalories', () => {
        it('should calculate cardio calories correctly', () => {
            const workout = {
                type: 'cardio',
                name: 'running',
                duration: 30
            };
            const calories = calculateCalories(workout, 70);
            expect(calories).toBeGreaterThan(0);
            expect(typeof calories).toBe('number');
        });

        it('should calculate resistance calories correctly', () => {
            const workout = {
                type: 'resistance',
                exercises: [
                    { name: 'Bench Press', sets: 3, reps: 10, weight: 60 },
                    { name: 'Squats', sets: 3, reps: 10, weight: 80 }
                ]
            };
            const calories = calculateCalories(workout, 70);
            expect(calories).toBeGreaterThan(0);
        });

        it('should return a number', () => {
            const workout = { type: 'cardio', duration: 20 };
            const result = calculateCalories(workout);
            expect(typeof result).toBe('number');
        });
    });
});
