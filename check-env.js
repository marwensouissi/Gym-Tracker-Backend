import { config } from './src/config/env.js';

console.log('\n=== Environment Configuration Check ===\n');
console.log('PORT:', config.PORT);
console.log('NODE_ENV:', config.NODE_ENV);
console.log('MONGO_URI:', config.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', config.JWT_SECRET ? '✅ Set' : '❌ Missing');

// For security, only show if key exists, not the actual key
if (config.GEMINI_API_KEY) {
    const keyPreview = config.GEMINI_API_KEY.substring(0, 10) + '...';
    console.log('GEMINI_API_KEY:', `✅ Set (${keyPreview})`);
    console.log('Key length:', config.GEMINI_API_KEY.length, 'characters');
} else {
    console.log('GEMINI_API_KEY: ❌ NOT SET');
    console.log('\n⚠️  You need to add GEMINI_API_KEY to your .env file!');
    console.log('Get a free key at: https://aistudio.google.com/app/apikey\n');
}

console.log('\n=======================================\n');
