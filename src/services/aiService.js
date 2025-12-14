import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from '../config/env.js';

let genAI;
let model;

// Initialize Gemini with safety settings
if (config.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

        // Configure safety settings
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH, // Relaxed for testing
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
            maxOutputTokens: 1024, // Limit output tokens
        };

        model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash', // Changed from gemini-1.5-flash
            safetySettings,
            generationConfig
        });
    } catch (e) {
        console.error('Failed to initialize Gemini:', e);
    }
}

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

// Utility: Safe JSON extraction
const extractJSON = (text) => {
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

    // Sanitize prompt
    const sanitizedPrompt = sanitizeInput(prompt, 3000);
    if (!sanitizedPrompt) return 'Invalid input provided.';

    for (let i = 0; i < retries; i++) {
        try {
            // Wrap in timeout
            const result = await withTimeout(
                model.generateContent(sanitizedPrompt),
                15000 // 15 second timeout
            );
            const response = await result.response;
            const text = response.text();

            // Validate output is not empty
            if (!text || text.trim().length < 10) {
                throw new Error('Empty or invalid response from AI');
            }

            return text;
        } catch (error) {
            console.error(`AI Attempt ${i + 1} failed:`, error.message);

            // Check for specific errors
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

export const generateWorkoutSuggestion = async (userProfile, lastWorkouts) => {
    // Sanitize and limit data
    const safeProfile = sanitizeInput(JSON.stringify(userProfile), 500);
    const safeWorkouts = sanitizeInput(JSON.stringify(lastWorkouts.slice(0, 3)), 1500);

    const prompt = `You are a professional fitness trainer. Provide a safe workout recommendation.

User: ${safeProfile}
Recent workouts: ${safeWorkouts}

Provide a brief, safe workout suggestion (200 words max). Focus on safety and progression.`;

    return await robustCall(prompt);
};

export const generateMealSuggestion = async (userProfile, targetCalories) => {
    // Validate and sanitize inputs
    const safeProfile = sanitizeInput(JSON.stringify(userProfile), 500);
    const safeCalories = Math.min(Math.max(parseInt(targetCalories) || 2000, 1200), 5000);

    const prompt = `You are a certified nutritionist. Suggest a healthy meal plan.

User: ${safeProfile}
Target calories: ${safeCalories}

Provide a brief, balanced meal plan (200 words max). Focus on nutrition and safety.`;

    return await robustCall(prompt);
};

export const generateWeeklySummary = async (workouts, meals) => {
    // Limit data to prevent token overflow
    const safeWorkouts = sanitizeInput(JSON.stringify(workouts.slice(0, 10)), 1500);
    const safeMeals = sanitizeInput(JSON.stringify(meals.slice(0, 10)), 1500);

    const prompt = `You are a fitness coach. Analyze this weekly data and provide insights.

Workouts: ${safeWorkouts}
Meals: ${safeMeals}

Provide a brief summary with insights and one actionable tip (250 words max).`;

    return await robustCall(prompt);
};
