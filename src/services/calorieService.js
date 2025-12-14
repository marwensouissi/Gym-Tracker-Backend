export const calculateCalories = (workout, userWeightKg = 70) => {
    let calories = 0;

    if (workout.type === 'cardio') {
        const met = getMETCheck(workout.name || 'general');
        const durationHours = (workout.duration || 30) / 60;
        // Formula: MET * Weight(kg) * Duration(hr)
        calories = met * userWeightKg * durationHours;
    } else if (workout.type === 'resistance') {
        // Simple Volume Load Formula Estimate
        // Volume = Sets * Reps * Weight
        // Rough estimate: Volume * 0.05 (very rough approximation)
        // Better: TIME based MET for weight lifting if volume isn't perfect.
        // Let's use a hybrid:
        // Basic Weight Lifting MET = 4.0
        // If volume provided, add bonus.

        let volume = 0;
        if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach(ex => {
                const w = ex.weight || 0;
                const r = ex.reps || 0;
                const s = ex.sets || 0;
                volume += (w * r * s);
            });
        }

        // Calories = (MET * Weight * Duration) + (Volume * Factor)
        // Let's stick to requested "strong-volume formula" focus.
        // We will assume 1 calorie per 30-40 kg volume? 
        // Let's use: Calories = Volume * 0.03
        calories = volume * 0.03;

        // If result is too low (e.g. no weight data), fall back to duration
        if (calories < 50 && workout.duration) {
            const met = 3.5; // Moderate lifting
            const durationHours = workout.duration / 60;
            calories = met * userWeightKg * durationHours;
        }
    }

    return Math.round(calories);
};

const getMETCheck = (activityName) => {
    const activity = activityName.toLowerCase();
    if (activity.includes('run')) return 9.8;
    if (activity.includes('cycle') || activity.includes('bike')) return 7.5;
    if (activity.includes('swim')) return 8.0;
    if (activity.includes('walk')) return 3.8;
    if (activity.includes('hiit')) return 8.0;
    return 5.0; // General moderate exercise
};
