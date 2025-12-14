import Joi from 'joi';
import UserProfile from '../models/UserProfile.js';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        let profile = await UserProfile.findOne({ user: req.user._id });

        if (!profile) {
            // Create default profile if doesn't exist
            profile = await UserProfile.create({
                user: req.user._id,
                activityLevel: 'moderately_active',
                experienceLevel: 'beginner'
            });
        }

        // Add calculated fields
        const profileData = profile.toObject();
        profileData.bmi = profile.calculateBMI();
        profileData.weightProgress = profile.getWeightProgress();

        res.json(profileData);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Create or Update user profile
// @route   POST /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
    const schema = Joi.object({
        age: Joi.number().min(13).max(120),
        gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
        height: Joi.number().min(100).max(250),
        currentWeight: Joi.number().min(30).max(300),
        weightUnit: Joi.string().valid('kg', 'lbs'),
        medicalConditions: Joi.array().items(Joi.object({
            condition: Joi.string().required(),
            severity: Joi.string().valid('mild', 'moderate', 'severe'),
            notes: Joi.string()
        })),
        allergies: Joi.array().items(Joi.string()),
        injuries: Joi.array().items(Joi.object({
            description: Joi.string().required(),
            affectedArea: Joi.string(),
            recoveryStatus: Joi.string().valid('recovering', 'recovered', 'chronic')
        })),
        fitnessGoals: Joi.array().items(
            Joi.string().valid('weight_loss', 'muscle_gain', 'endurance', 'strength',
                'flexibility', 'general_fitness', 'rehabilitation')
        ),
        targetWeight: Joi.number().min(30).max(300),
        activityLevel: Joi.string().valid('sedentary', 'lightly_active', 'moderately_active',
            'very_active', 'extremely_active'),
        dietaryRestrictions: Joi.array().items(
            Joi.string().valid('vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free',
                'dairy_free', 'low_carb', 'keto', 'paleo', 'none')
        ),
        experienceLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
        workoutFrequency: Joi.number().min(0).max(14)
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        let profile = await UserProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update existing profile
            Object.assign(profile, req.body);
            profile.updatedAt = Date.now();
            await profile.save();
        } else {
            // Create new profile
            profile = await UserProfile.create({
                user: req.user._id,
                ...req.body
            });
        }

        // Add calculated fields
        const profileData = profile.toObject();
        profileData.bmi = profile.calculateBMI();
        profileData.weightProgress = profile.getWeightProgress();

        res.json(profileData);
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Update only weight (adds to history)
// @route   PUT /api/profile/weight
// @access  Private
export const updateWeight = async (req, res) => {
    const schema = Joi.object({
        weight: Joi.number().min(30).max(300).required(),
        unit: Joi.string().valid('kg', 'lbs').default('kg')
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        let profile = await UserProfile.findOne({ user: req.user._id });

        if (!profile) {
            // Create profile if doesn't exist
            profile = await UserProfile.create({
                user: req.user._id,
                currentWeight: req.body.weight,
                weightUnit: req.body.unit || 'kg'
            });
        } else {
            // Update weight (pre-save hook will add to history)
            profile.currentWeight = req.body.weight;
            profile.weightUnit = req.body.unit || profile.weightUnit;
            await profile.save();
        }

        res.json({
            message: 'Weight updated successfully',
            currentWeight: profile.currentWeight,
            unit: profile.weightUnit,
            bmi: profile.calculateBMI(),
            weightProgress: profile.getWeightProgress(),
            totalRecords: profile.weightHistory.length
        });
    } catch (err) {
        console.error('Error updating weight:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get weight history
// @route   GET /api/profile/weight-history
// @access  Private
export const getWeightHistory = async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ user: req.user._id });

        if (!profile) {
            return res.json({ weightHistory: [] });
        }

        // Return weight history sorted by date (newest first)
        const history = profile.weightHistory
            .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

        res.json({
            weightHistory: history,
            currentWeight: profile.currentWeight,
            unit: profile.weightUnit,
            progress: profile.getWeightProgress()
        });
    } catch (err) {
        console.error('Error fetching weight history:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};
