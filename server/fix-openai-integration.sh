#!/bin/bash
# filepath: /Users/markomanninen/Documents/GitHub/tgdmemory/tgdmemory/server/fix-openai-integration.sh
# fix-openai-integration.sh - Fix OpenAI integration to properly support GPT-4.1-nano

echo "Fixing OpenAI integration for GPT-4.1-nano support..."

# Backup current file
cp openai-integration.js openai-integration.js.bak
echo "Backed up current file to openai-integration.js.bak"

cat > openai-integration.js << 'EOF'
// openai-integration.js - OpenAI API integration for equation explanations
const OpenAI = require('openai');

// Initialize the OpenAI client with your API key
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Get available models - this can be used to check model availability
async function listAvailableModels() {
  if (!openai) return [];
  try {
    const models = await openai.models.list();
    return models.data;
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
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

    if (modelName.includes('nano')) {
      // Optimized prompt for nano models - more concise and to the point
      systemMessage = "You're a math expert explaining equations concisely using HTML with LaTeX in $ or $$ delimiters.";
      
      prompt = `Explain this math equation:
${title ? `TITLE: ${title}` : 'EQUATION:'}
LATEX: ${latex}

Include:
1. Symbol meanings
2. Conceptual significance
3. Context in ${title?.split(' - ')[0] || 'physics/mathematics'}
4. Brief example if appropriate

Use HTML formatting with paragraphs. Use LaTeX in $ or $$ for math.`;
    } else {
      // Standard prompt for more powerful models
      systemMessage = "You are a mathematical expert specializing in explaining complex equations clearly. Provide explanations using HTML formatting. Use LaTeX notation for mathematical expressions, wrapped in $ or $$ delimiters.";
      
      prompt = `Please explain the following mathematical equation in detail:

${title ? `Title: ${title}` : 'Equation:'}

LaTeX code: ${latex}

Provide a clear, step-by-step explanation of this equation, including:
1. What each variable or symbol represents
2. The conceptual meaning of the equation
3. How it relates to the broader context (${title?.split(' - ')[0] || 'physics/mathematics'})
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

module.exports = { generateExplanationWithOpenAI, listAvailableModels };
EOF

chmod +x fix-openai-integration.sh
echo "OpenAI integration fixed for GPT-4.1-nano support"
echo "Added listAvailableModels function for model checking"
echo ""
echo "To test the integration, run:"
echo "  npm run test:openai-nano"
echo "  npm run test:compare"
