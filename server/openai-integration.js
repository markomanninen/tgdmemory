// openai-integration.js - OpenAI API integration for equation explanations
const OpenAI = require('openai');
require('dotenv').config();

// Initialize the OpenAI client with your API key
console.log('OpenAI Integration - Loading environment...');
console.log('OPENAI_API_KEY exists:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || 'Not set (will use default)');

let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    console.log('Initializing OpenAI client with API key...');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.error('ERROR: OPENAI_API_KEY is not set in environment variables');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error.message);
}

/**
 * Generate an explanation for a LaTeX equation using OpenAI's GPT model
 * 
 * @param {string} latex - The LaTeX equation to explain
 * @param {string} title - Optional title or context for the equation
 * @returns {Promise<string>} - HTML-formatted explanation
 */
async function generateExplanationWithOpenAI(latex, title) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY.');
    }

    const modelName = process.env.OPENAI_MODEL || "gpt-4.1-nano";
    console.log(`Generating explanation with OpenAI model ${modelName} for:`, title || 'Untitled equation');

    // Customize the prompt based on the model being used
    let prompt;
    let systemMessage;

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

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
      max_tokens: parseInt(process.env.MAX_TOKENS || "1500")
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
    
    return formattedExplanation;
  } catch (error) {
    console.error('Error generating explanation with OpenAI:', error);
    return null;
  }
}

module.exports = { generateExplanationWithOpenAI };
