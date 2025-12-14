import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('\n=== Gemini API Test ===\n');

if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
}

console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);
console.log(`   Length: ${apiKey.length} characters\n`);

console.log('Testing API connection...\n');

try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try different model names
    console.log('Trying model: gemini-1.5-pro...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    console.log('Sending test request to Gemini...');

    const result = await model.generateContent('Say hello in one word');
    const response = await result.response;
    const text = response.text();

    console.log('\n✅ SUCCESS! Gemini API is working!');
    console.log('Response:', text);
    console.log('\n🎉 Your API key is valid and working!\n');

} catch (error) {
    console.log('\n❌ ERROR: API call failed\n');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);

    if (error.message?.includes('API_KEY_INVALID')) {
        console.log('\n⚠️  Your API key appears to be invalid.');
        console.log('1. Get a new key at: https://aistudio.google.com/app/apikey');
        console.log('2. Make sure you copied the ENTIRE key');
        console.log('3. Check for extra spaces in your .env file\n');
    } else if (error.message?.includes('quota')) {
        console.log('\n⚠️  API quota exceeded. Wait a few minutes and try again.\n');
    } else {
        console.log('\n⚠️  Network or API issue. Check:');
        console.log('- Internet connection');
        console.log('- Firewall settings');
        console.log('- Try again in a few minutes\n');
    }
}
