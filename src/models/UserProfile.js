import mongoose from 'mongoose';

const weightHistorySchema = new mongoose.Schema({
    weight: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
});

const userProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Basic Physical Stats
    age: {
        type: Number,
        min: 13,
        max: 120
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        default: 'prefer_not_to_say'
    },
    height: {
        type: Number, // in cm
        min: 100,
        max: 250
    },
    currentWeight: {
        type: Number, // in kg
        min: 30,
        max: 300
    },
    weightUnit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
    },

    // Weight History (stores all past weights)
    weightHistory: [weightHistorySchema],

    // Health Conditions
    medicalConditions: [{
        condition: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        },
        notes: String
    }],
    allergies: [String],
    injuries: [{
        description: String,
        affectedArea: String,
        recoveryStatus: {
            type: String,
            enum: ['recovering', 'recovered', 'chronic']
        }
    }],

    // Fitness Goals
    fitnessGoals: [{
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness', 'rehabilitation']
    }],
    targetWeight: Number,

    // Activity Level
    activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
        default: 'moderately_active'
    },

    // Dietary Preferences
    dietaryRestrictions: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'dairy_free', 'low_carb', 'keto', 'paleo', 'none']
    }],

    // Additional Info
    experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    workoutFrequency: {
        type: Number, // workouts per week
        min: 0,
        max: 14
    },

    // Timestamps
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware: Add to weight history when weight is updated
userProfileSchema.pre('save', function (next) {
    if (this.isModified('currentWeight') && this.currentWeight) {
        this.weightHistory.push({
            weight: this.currentWeight,
            unit: this.weightUnit || 'kg',
            recordedAt: new Date()
        });
    }
    next();
});

// Method: Get latest weight record
userProfileSchema.methods.getLatestWeight = function () {
    if (this.weightHistory.length === 0) {
        return { weight: this.currentWeight, unit: this.weightUnit };
    }
    return this.weightHistory[this.weightHistory.length - 1];
};

// Method: Calculate BMI
userProfileSchema.methods.calculateBMI = function () {
    if (!this.currentWeight || !this.height) return null;
    const heightInMeters = this.height / 100;
    return (this.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Method: Get weight progress (last 30 days)
userProfileSchema.methods.getWeightProgress = function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentWeights = this.weightHistory.filter(
        w => new Date(w.recordedAt) >= thirtyDaysAgo
    );

    if (recentWeights.length < 2) return null;

    const oldest = recentWeights[0].weight;
    const newest = recentWeights[recentWeights.length - 1].weight;
    const change = newest - oldest;

    return {
        change: change.toFixed(1),
        trend: change > 0 ? 'gaining' : change < 0 ? 'losing' : 'stable'
    };
};

export default mongoose.model('UserProfile', userProfileSchema);
