// debug-env.js - Debug environment variable loading
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('=== Environment Variable Debugging ===');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log(`Checking for .env file at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

if (fs.existsSync(envPath)) {
  try {
    // Read file contents but mask the actual API keys
    const envContent = fs.readFileSync(envPath, 'utf8')
      .replace(/(GOOGLE_API_KEY=)(.+)/, '$1[MASKED]')
      .replace(/(OPENAI_API_KEY=)(.+)/, '$1[MASKED]');
    
    console.log('\n.env file content (API keys masked):');
    console.log(envContent);
  } catch (error) {
    console.error('Error reading .env file:', error);
  }
}

// Check if keys are available in process.env
console.log('\nEnvironment variables loaded:');
console.log('GOOGLE_API_KEY present:', process.env.GOOGLE_API_KEY ? 'Yes' : 'No');
console.log('OPENAI_API_KEY present:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || 'Not set');
console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL || 'Not set');

// Create a sample OpenAI client to check for initialization issues
console.log('\nTrying to initialize OpenAI client:');
try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI client initialization successful');
  } else {
    console.log('Cannot initialize OpenAI client - OPENAI_API_KEY not found');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error.message);
}

// Create a sample Gemini client to check for initialization issues
console.log('\nTrying to initialize Gemini client:');
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GOOGLE_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-preview-05-20";
    console.log(`Attempting to initialize Gemini model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log('Gemini model initialization successful');
    } catch (modelError) {
      console.error('Error initializing Gemini model:', modelError.message);
    }
  } else {
    console.log('Cannot initialize Gemini client - GOOGLE_API_KEY not found');
  }
} catch (error) {
  console.error('Error initializing Gemini client:', error.message);
}

console.log('\n=== Debugging Complete ===');
