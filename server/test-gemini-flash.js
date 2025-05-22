// test-gemini-flash.js - Test the latest Gemini Flash model
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

// Test equation to explain
const testEquation = "\\begin{equation} E = mc^2 \\end{equation}";
const testTitle = "Einstein's Energy-Mass Equivalence";

async function testGeminiFlash() {
  try {
    console.log('Testing latest Gemini Flash model...');
    
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Error: GOOGLE_API_KEY is not set in .env file');
      process.exit(1);
    }
    
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    console.log(`Using model: ${modelName}`);
    
    const genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
    
    try {
      // Test the model with a simple prompt to verify it works
      console.log('Testing model with a simple prompt...');
      const testResult = await genAI.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'system',
            parts: [{ text: 'You are a helpful assistant' }]
          },
          {
            role: 'user',
            parts: [{ text: 'Say hello' }]
          }
        ],
        config: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'text/plain',
        }
      });
      
      const testText = testResult.candidates[0].content.parts.map(p => p.text).join('').trim();
      console.log(`Test response: "${testText}"`);
      console.log(`✅ Successfully tested model: ${modelName}`);
    } catch (error) {
      console.error(`Failed to use model ${modelName}:`, error.message);
      throw new Error(`Model ${modelName} is not available or encountered an error.`);
    }
    
    console.log('Generating explanation...');
    
    // Optimized prompt for Flash models
    const prompt = `
    I need a clear explanation of this mathematical equation:

    ${testTitle ? `TITLE: ${testTitle}` : 'EQUATION:'}
    LATEX: ${testEquation}

    Important instructions:
    - DO NOT repeat the equation itself - it's already shown elsewhere
    - DO NOT use title, head, html, or body tags
    - DO NOT include a title heading - the title is already displayed

    Explain:
    1. Each variable's meaning
    2. The equation's conceptual significance
    3. Its relevance to physics
    4. A practical example if possible

    Format your response in HTML with paragraphs. Use LaTeX notation for any mathematics: $ for inline and $$ for display math.
    `;
    
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
        maxOutputTokens: parseInt(process.env.MAX_TOKENS || "1024"),
        responseMimeType: 'text/plain',
      }
    });
    
    // Get the text response from the model
    const text = result.candidates[0].content.parts.map(p => p.text).join('').trim();
    
    console.log('\n===== EXPLANATION RESULT =====\n');
    console.log(text);
    console.log('\n==============================\n');
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error testing Gemini model:', error);
    
    if (error.message && error.message.includes('not found')) {
      console.error('\nERROR: The requested model may not be available in your region or with your API key permissions.');
      console.error('Please run the list-available-gemini-models.js script to check which models are available to you.');
    }
  }
}

testGeminiFlash();
