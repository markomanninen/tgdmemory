// check-models.js - Check available Gemini models and their capabilities
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkAvailableModels() {
  try {
    console.log('Checking available Gemini models...');
    
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Error: GOOGLE_API_KEY is not set in .env file');
      process.exit(1);
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // List of models to check
    const modelsToCheck = [
      'gemini-2.5-flash-preview-05-20',
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro-vision'
    ];
    
    console.log('\nAttempting to initialize each model:');
    console.log('----------------------------------');
    
    for (const modelName of modelsToCheck) {
      try {
        console.log(`\nChecking model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Try a simple test prompt to verify the model works
        const result = await model.generateContent('Say hello');
        const text = result.response.text();
        
        console.log(`✅ Success: ${modelName}`);
        console.log(`Response: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`);
      } catch (modelError) {
        console.log(`❌ Failed: ${modelName}`);
        console.log(`   Error: ${modelError.message}`);
      }
    }
    
    console.log('\nModel availability check complete.');
    console.log('\nRecommended model for equation explanations: gemini-2.5-flash-preview-05-20');
    console.log('Add to your .env file:');
    console.log('GEMINI_MODEL=gemini-2.5-flash-preview-05-20');
    
  } catch (error) {
    console.error('Error checking models:', error);
  }
}

checkAvailableModels();
