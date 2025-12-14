import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: [true, 'Please add a meal name']
    },
    foodItems: [{
        name: String,
        quantity: String, // e.g., "100g", "1 cup"
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    }],
    totalCalories: {
        type: Number,
        required: true
    },
    totalProtein: Number,
    totalCarbs: Number,
    totalFat: Number,
    aiEstimated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Meal', mealSchema);
