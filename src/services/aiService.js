// Install this package: npm install @google/generative-ai dotenv
// Make sure you have a .env file in your project root with the key:
// GEMINI_API_KEY="YOUR_API_KEY_HERE"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import 'dotenv/config'; // Loads variables from .env into process.env

// Access the key directly from the environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI;
let model;

// --- INITIALIZATION BLOCK ---
if (GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        // Configure safety settings
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ];

        // Configure generation settings
        const generationConfig = {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2000,
        };

        model = genAI.getGenerativeModel({
            // 'gemini-2.5-flash' is the recommended model for the free tier
            model: 'gemini-2.5-flash',
            safetySettings,
            generationConfig
        });
    } catch (e) {
        console.error('Failed to initialize Gemini:', e.message);
        model = null; // Mark model as unavailable
    }
} else {
    console.error("AI Service Unavailable: GEMINI_API_KEY not found in environment. Please check your .env file.");
    model = null; // Mark model as unavailable
}
// --- END INITIALIZATION BLOCK ---


// Utility: Timeout wrapper
const withTimeout = (promise, timeoutMs = 15000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)
        )
    ]);
};

// Utility: Input sanitization
const sanitizeInput = (text, maxLength = 2000) => {
    if (typeof text !== 'string') return '';

    // Remove potential prompt injection patterns
    let sanitized = text
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/system:|assistant:|user:/gi, '') // Remove role markers
        .replace(/```/g, '') // Remove code blocks
        .trim();

    // Limit length to prevent token overflow
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength) + '...';
    }

    return sanitized;
};

// Utility: Safe JSON extraction (Kept for completeness, though not used in the exports)
export const extractJSON = (text) => {
    try {
        // Try to parse as-is first
        return JSON.parse(text);
    } catch {
        // Try to find JSON block in markdown
        const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch {
                return null;
            }
        }
        return null;
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Robust API call with retry logic
const robustCall = async (prompt, retries = 3, backoff = 1000) => {
    if (!model) return 'AI Service Unavailable. Please configure GEMINI_API_KEY.';

    const sanitizedPrompt = sanitizeInput(prompt, 3000);
    if (!sanitizedPrompt) return 'Invalid input provided.';

    for (let i = 0; i < retries; i++) {
        try {
            const result = await withTimeout(
                model.generateContent(sanitizedPrompt),
                15000
            );
            const response = await result.response;
            const text = response.text();

            if (!text || text.trim().length < 10) {
                throw new Error('Empty or invalid response from AI');
            }

            return text;
        } catch (error) {
            console.error(`AI Attempt ${i + 1} failed:`, error.message);

            if (error.message?.includes('timeout')) {
                if (i === retries - 1) return 'AI service is currently slow. Please try again.';
            } else if (error.message?.includes('SAFETY')) {
                return 'Response blocked due to safety filters. Please rephrase your request.';
            } else if (error.message?.includes('quota') || error.message?.includes('429')) {
                return 'AI service quota exceeded. Please try again later.';
            }

            if (i === retries - 1) {
                return 'AI Service temporarily unavailable. Please try again later.';
            }

            // Exponential backoff
            await sleep(backoff * Math.pow(2, i));
        }
    }
};

// --- HELPER FUNCTIONS ---

/**
 * Formats user profile data for AI prompts
 */
const formatProfileSection = (userProfile) => {
    const health = userProfile.health || {};
    return `**CLIENT PROFILE:**
- Name: ${userProfile.name || 'Client'}
- Age: ${health.age || 'Not specified'} years
- Gender: ${health.gender || 'Not specified'}
- Height: ${health.height ? health.height + 'cm' : 'Not specified'}
- Current Weight: ${health.currentWeight ? health.currentWeight + health.weightUnit : 'Not specified'}
- BMI: ${health.bmi || 'Not calculated'}
- Experience Level: ${health.experienceLevel || 'beginner'}
- Fitness Goals: ${health.fitnessGoals?.join(', ') || 'general fitness'}
- Activity Level: ${health.activityLevel || 'moderate'}
- Workout Frequency: ${health.workoutFrequency || '3'} times/week`;
};

/**
 * Formats medical considerations for AI prompts
 */
const formatMedicalSection = (userProfile) => {
    const health = userProfile.health || {};
    return `**MEDICAL CONSIDERATIONS:**
- Conditions: ${health.medicalConditions?.length > 0 ? health.medicalConditions.join(', ') : 'None reported'}
- Injuries: ${health.injuries?.length > 0 ? health.injuries.map(i => `${i.description} (${i.status})`).join(', ') : 'None reported'}
- Allergies: ${health.allergies?.length > 0 ? health.allergies.join(', ') : 'None'}`;
};

/**
 * Formats recent activity stats for AI prompts
 */
const formatActivitySection = (userProfile, additionalData = '') => {
    const stats = userProfile.stats || {};
    return `**RECENT ACTIVITY:**
- Total Workouts: ${stats.totalWorkouts || 0}
- Avg Calories/Workout: ${stats.avgCaloriesPerWorkout || 0} kcal${additionalData ? '\n' + additionalData : ''}`;
};

/**
 * Formats dietary requirements for AI prompts
 */
const formatDietarySection = (userProfile, targetCalories, macros) => {
    const health = userProfile.health || {};
    const goals = health.fitnessGoals || [];

    return `**DIETARY REQUIREMENTS:**
- Restrictions: ${health.dietaryRestrictions?.length > 0 ? health.dietaryRestrictions.join(', ') : 'None'}
- Allergies: ${health.allergies?.length > 0 ? health.allergies.join(', ') : 'None'}
- Fitness Goals: ${goals.join(', ') || 'general health'}

**NUTRITION TARGET:**
- Daily Calories: ${targetCalories} kcal
- Suggested Macros: ${macros.protein} Protein, ${macros.carbs} Carbs, ${macros.fat} Fat
- Weight Trend: ${health.weightProgress?.trend || 'stable'}`;
};

/**
 * Calculate recommended macros based on fitness goals
 */
const calculateMacros = (userProfile) => {
    const goals = userProfile.health?.fitnessGoals || [];
    return {
        protein: goals.includes('muscle_gain') ? '30%' : '25%',
        carbs: goals.includes('weight_loss') ? '35%' : '45%',
        fat: '30%'
    };
};

// --- EXPORTED FUNCTIONS ---

/**
 * Generates a workout suggestion based on user profile and recent history.
 */
export const generateWorkoutSuggestion = async (userProfile, lastWorkouts = [], userRequest = '') => {
    const safeWorkouts = sanitizeInput(JSON.stringify(lastWorkouts.slice(0, 3)), 1500);
    const goals = userProfile.health?.fitnessGoals || [];
    const health = userProfile.health || {};

    const userInstruction = sanitizeInput(userRequest, 300) || 'Provide a full workout program for today.';

    const prompt = `You are a professional ACSM-certified fitness trainer.

Client profile:
- Name: ${userProfile.name || 'Client'}
- Age: ${health.age || 'N/A'}
- Gender: ${health.gender || 'N/A'}
- Height: ${health.height ? health.height + 'cm' : 'N/A'}
- Weight: ${health.currentWeight ? health.currentWeight + health.weightUnit : 'N/A'}
- BMI: ${health.bmi || 'N/A'}
- Experience Level: ${health.experienceLevel || 'beginner'}
- Fitness Goals: ${goals.join(', ') || 'general fitness'}
- Activity Level: ${health.activityLevel || 'moderate'}
- Recent Workouts: ${safeWorkouts || 'None'}

Medical considerations:
- Conditions: ${health.medicalConditions?.join(', ') || 'None'}
- Injuries: ${health.injuries?.map(i => `${i.description} (${i.status})`).join(', ') || 'None'}
- Allergies: ${health.allergies?.join(', ') || 'None'}

**Task:** ${userInstruction}

**Instructions for output:**
- Use Markdown lists for exercises
- Include sets, reps, or duration for each exercise
- Include warm-up and cool-down
- Respond ONLY with the workout plan, no intros`;

    return await robustCall(prompt);
};


/**
 * Generates a meal suggestion based on user profile and calorie goals.
 */
export const generateMealSuggestion = async (userProfile, targetCalories, userRequest = '') => {
    const safeCalories = Math.min(Math.max(parseInt(targetCalories) || 2000, 1200), 5000);
    const macros = calculateMacros(userProfile);
    const goals = userProfile.health?.fitnessGoals || [];
    const health = userProfile.health || {};

    // Sanitize user request or default
    const userInstruction = sanitizeInput(userRequest, 300) || 'Suggest one specific meal/dish for today.';

    // Prompt rewritten to force Gemini to output a real dish
    const prompt = `You are a registered dietitian (RD).

User profile:
- Name: ${userProfile.name || 'Client'}
- Age: ${health.age || 'N/A'}
- Gender: ${health.gender || 'N/A'}
- Activity level: ${health.activityLevel || 'moderate'}
- Fitness goal: ${goals.join(', ') || 'general health'}
- Dietary restrictions: ${health.dietaryRestrictions?.join(', ') || 'None'}
- Allergies: ${health.allergies?.join(', ') || 'None'}

**Task:** Provide **one specific meal/dish suggestion for today**.  
Include:
- Name of the dish
- Ingredients
- Simple preparation instructions
- Estimated calories

Respond **only with the dish**—do NOT include generic intros or summaries.

User request: ${userInstruction}`;

    return await robustCall(prompt);
};


/**
 * Generates a weekly summary and actionable tip.
 */
export const generateWeeklySummary = async (workouts, meals, userProfile = {}, userRequest = '') => {
    const safeWorkouts = sanitizeInput(JSON.stringify(workouts.slice(0, 10)), 1500);
    const safeMeals = sanitizeInput(JSON.stringify(meals.slice(0, 10)), 1500);
    const health = userProfile.health || {};
    const stats = userProfile.stats || {};

    // Sanitize user request
    const userInstruction = sanitizeInput(userRequest, 300) || 'Provide a comprehensive weekly review.';

    const prompt = `You are an experienced fitness coach conducting a weekly review.

${formatProfileSection(userProfile)}
- Target Weight: ${health.targetWeight ? health.targetWeight + health.weightUnit : 'Not set'}

**PROGRESS TRACKING:**
- Weight Trend (30 days): ${health.weightProgress?.change || 'N/A'} (${health.weightProgress?.trend || 'stable'})
- All-Time Workouts: ${stats.totalWorkouts || 0}
- Avg Calories/Workout: ${stats.avgCaloriesPerWorkout || 0} kcal

**THIS WEEK'S DATA:**
Workouts: ${safeWorkouts}
Meals: ${safeMeals}

**ANALYSIS REQUIRED:**
${userInstruction}

If the user request is generic, provide the following:
1. **Workout Performance** (Sessions, Calories, Type distribution)
2. **Nutrition Analysis** (Meals logged, Avg calories, Goal alignment)
3. **Progress Assessment** (Target weight movement, BMI trend)
4. **Next Week Recommendation** (Actionable change)

{{ ... }}

Format (max 400 words): Use Markdown.`;

    return await robustCall(prompt);
};