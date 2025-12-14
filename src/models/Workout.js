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
        sets: Number,
        reps: Number,
        weight: Number, // in kg or lbs
        duration: Number, // in minutes (for cardio)
        distance: Number // in km (for cardio)
    }],
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
