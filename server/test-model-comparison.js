// test-model-comparison.js - Compare explanation outputs from both OpenAI and Gemini models
require('dotenv').config();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test equation to explain
const testEquation = "\\begin{equation} E = mc^2 \\end{equation}";
const testTitle = "Einstein's Energy-Mass Equivalence";

async function compareModelOutputs() {
  console.log('Comparing model outputs for equation explanation...\n');
  console.log(`Test equation: ${testEquation}`);
  console.log(`Test title: ${testTitle}\n`);
  
  // First test OpenAI
  try {
    console.log('1. Testing OpenAI GPT-4.1-nano model...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not set in .env file');
      console.log('Skipping OpenAI test');
    } else {
      const modelName = process.env.OPENAI_MODEL || 'gpt-4.1-nano';
      console.log(`Using model: ${modelName}`);
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      console.log('Generating explanation...');
      
      // Customize the prompt based on the model being used
      let systemMessage;
      let prompt;

    /*
      if (modelName.includes('nano')) {
        systemMessage = "You're a math expert explaining equations concisely using HTML with LaTeX in $ or $$ delimiters.";
        
        prompt = `Explain this math equation:
TITLE: ${testTitle}
LATEX: ${testEquation}

Include:
1. Symbol meanings
2. Conceptual significance
3. Context in physics
4. Brief example if appropriate

Use HTML formatting with paragraphs. Use LaTeX in $ or $$ for math.`;
      } else {
        systemMessage = "You are a mathematical expert specializing in explaining complex equations clearly. Provide explanations using HTML formatting. Use LaTeX notation for mathematical expressions, wrapped in $ or $$ delimiters.";
        
        prompt = `Please explain the following mathematical equation in detail:

Title: ${testTitle}

LaTeX code: ${testEquation}

Provide a clear, step-by-step explanation of this equation, including:
1. What each variable or symbol represents
2. The conceptual meaning of the equation
3. How it relates to the broader context of physics
4. If applicable, a simple example applying this equation

Format the response using HTML paragraphs and include appropriate mathematical notation.`;
      }
*/
    
    systemMessage = `You're a math expert explaining equations concisely using HTML with LaTeX in $ or $$ delimiters.`;
    
    prompt = `Explain this math equation:
TITLE: ${title}
LATEX: ${latex}

Include:
1. Symbol meanings
2. Conceptual significance
3. Context in ${title?.split(' - ')[0] || 'physics/mathematics'}
4. Brief example if appropriate

Important formatting guidelines:
- DO NOT include title, head, html, or body tags
- DO NOT repeat the equation itself - it's already displayed
- DO NOT include the title of the equation as a heading
- DO NOT start with "The equation is given by:" or similar text
- Start directly with the explanation using h3 headings for sections
- Use HTML formatting with paragraphs
- Use LaTeX in $ or $$ for math.`;
      
      const startTime = Date.now();
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
        max_tokens: parseInt(process.env.MAX_TOKENS || "1024")
      });
      const endTime = Date.now();
      
      const timeElapsed = (endTime - startTime) / 1000;
      const explanation = response.choices[0].message.content;
      
      console.log(`\n✅ OpenAI explanation generated in ${timeElapsed.toFixed(2)} seconds`);
      console.log('\n===== OPENAI EXPLANATION =====\n');
      console.log(explanation);
      console.log('\n==============================\n');
    }
  } catch (error) {
    console.error('Error testing OpenAI model:', error);
  }
  
  // Then test Gemini
  try {
    console.log('\n2. Testing Gemini 2.5 Flash model...');
    
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Error: GOOGLE_API_KEY is not set in .env file');
      console.log('Skipping Gemini test');
    } else {
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
      
      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const endTime = Date.now();
      
      const timeElapsed = (endTime - startTime) / 1000;
      const response = result.response;
      const text = response.text();
      
      console.log(`\n✅ Gemini explanation generated in ${timeElapsed.toFixed(2)} seconds`);
      console.log('\n===== GEMINI EXPLANATION =====\n');
      console.log(text);
      console.log('\n==============================\n');
    }
  } catch (error) {
    console.error('Error testing Gemini model:', error);
    
    if (error.message && error.message.includes('not found')) {
      console.error('\nERROR: The model "gemini-2.5-flash-preview-05-20" may not be available in your region or with your API key permissions.');
      console.error('Please check that you have access to the latest Gemini models in your Google AI Studio account.');
    }
  }
  
  console.log('\nComparison test completed!');
  console.log('Review both outputs to compare quality, formatting, and response time.');
}

compareModelOutputs();
