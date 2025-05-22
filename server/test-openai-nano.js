// test-openai-nano.js - Test the OpenAI GPT-4.1-nano model
require('dotenv').config();
const OpenAI = require('openai');

// Test equation to explain
const testEquation = "\\begin{equation} E = mc^2 \\end{equation}";
const testTitle = "Einstein's Energy-Mass Equivalence";

async function testOpenAINano() {
  try {
    console.log('Testing OpenAI GPT-4.1-nano model...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not set in .env file');
      process.exit(1);
    }
    
    const modelName = process.env.OPENAI_MODEL || 'gpt-4.1-nano';
    console.log(`Using model: ${modelName}`);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('Generating explanation...');
    
    // Customize the prompt based on the model being used
    let systemMessage;
    let prompt;

    if (modelName.includes('nano')) {
      // Optimized prompt for nano models - more concise and to the point
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
      // Standard prompt for more powerful models
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
    
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
      max_tokens: parseInt(process.env.MAX_TOKENS || "1024")
    });
    
    const explanation = response.choices[0].message.content;
    
    // Format the response as HTML if needed
    let formattedExplanation = explanation;
    
    // If the response doesn't contain HTML paragraph tags, wrap it
    if (!formattedExplanation.includes('<p>')) {
      formattedExplanation = formattedExplanation
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');
      formattedExplanation = `<p>${formattedExplanation}</p>`;
    }
    
    console.log('\n===== EXPLANATION RESULT =====\n');
    console.log(formattedExplanation);
    console.log('\n==============================\n');
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error testing OpenAI GPT-4.1-nano model:', error);
    
    if (error.message && error.message.includes('not found')) {
      console.error('\nERROR: The model "gpt-4.1-nano" may not be available with your API key permissions.');
      console.error('Please check that you have access to the latest OpenAI models in your account.');
      console.error('You may need to update your account tier or request access to the model.');
    }
  }
}

testOpenAINano();
