import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['cardio', 'resistance'],
        required: [true, 'Please specify workout type']
    },
    exercises: [{
        name: String,
        // Resistance-specific fields
        sets: Number,
        reps: Number,
        weight: Number, // in kg or lbs
        // Cardio-specific fields
        duration: Number, // in minutes (for cardio)
        distance: Number // in km (for cardio)
    }],
    // Total workout duration - used for cardio workouts
    duration: {
        type: Number,
        default: 0
    },
    caloriesBurned: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('Workout', workoutSchema);
