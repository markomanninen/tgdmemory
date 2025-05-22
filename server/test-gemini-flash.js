// test-gemini-flash.js - Test the Gemini 2.5 Flash model
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test equation to explain
const testEquation = "\\begin{equation} E = mc^2 \\end{equation}";
const testTitle = "Einstein's Energy-Mass Equivalence";

async function testGeminiFlash() {
  try {
    console.log('Testing Gemini 2.5 Flash model...');
    
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Error: GOOGLE_API_KEY is not set in .env file');
      process.exit(1);
    }
    
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    console.log(`Using model: ${modelName}`);
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
        maxOutputTokens: parseInt(process.env.MAX_TOKENS || "1024"),
      }
    });
    
    console.log('Generating explanation...');
    
    const prompt = `
    Please explain the following mathematical equation in detail:
    
    Title: ${testTitle}
    
    LaTeX code: ${testEquation}
    
    Provide a clear, step-by-step explanation of this equation, including:
    1. What each variable or symbol represents
    2. The conceptual meaning of the equation
    3. How it relates to the broader context of physics
    4. A simple example applying this equation
    
    Format the response using HTML paragraphs and include appropriate mathematical notation using LaTeX wrapped in $ symbols for inline math and $$ for display math.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('\n===== EXPLANATION RESULT =====\n');
    console.log(text);
    console.log('\n==============================\n');
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error testing Gemini 2.5 Flash model:', error);
    
    if (error.message && error.message.includes('not found')) {
      console.error('\nERROR: The model "gemini-2.5-flash-preview-05-20" may not be available in your region or with your API key permissions.');
      console.error('Please check that you have access to the latest Gemini models in your Google AI Studio account.');
    }
  }
}

testGeminiFlash();
