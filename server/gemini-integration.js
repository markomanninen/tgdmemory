// gemini-integration.js - Google Gemini API integration for equation explanations
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client with your API key
let geminiModel;
if (process.env.GOOGLE_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  // Default to the new Gemini 2.5 Flash model if available, otherwise fall back to gemini-pro
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-preview-05-20";
  
  try {
    geminiModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
        maxOutputTokens: parseInt(process.env.MAX_TOKENS || "1024"),
      }
    });
    console.log(`Successfully initialized Gemini model: ${modelName}`);
  } catch (error) {
    console.error(`Failed to initialize model ${modelName}, falling back to gemini-pro:`, error.message);
    try {
      geminiModel = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
          maxOutputTokens: parseInt(process.env.MAX_TOKENS || "1024"),
        }
      });
      console.log('Successfully initialized fallback model: gemini-pro');
    } catch (fallbackError) {
      console.error('Failed to initialize fallback model:', fallbackError.message);
    }
  }
}

/**
 * Generate an explanation for a LaTeX equation using Google's Gemini model
 * 
 * @param {string} latex - The LaTeX equation to explain
 * @param {string} title - Optional title or context for the equation
 * @returns {Promise<string>} - HTML-formatted explanation
 */
async function generateExplanationWithGemini(latex, title) {
  try {
    if (!geminiModel) {
      throw new Error('Gemini model not initialized. Please set GOOGLE_API_KEY.');
    }
    
    console.log('Generating explanation with Gemini for:', title || 'Untitled equation');
    
    // Customize the prompt based on the model being used
    let prompt;
    if (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.includes('2.5-flash')) {
      // Optimized prompt for Gemini 2.5 Flash model
      prompt = `
      I need a clear explanation of this mathematical equation:

      ${title ? `TITLE: ${title}` : 'EQUATION:'}
      LATEX: ${latex}

      Explain:
      1. Each variable's meaning
      2. The equation's conceptual significance
      3. Its relevance to ${title?.split(' - ')[0] || 'physics/mathematics'}
      4. A practical example if possible

      Format your response in HTML with paragraphs. Use LaTeX notation for any mathematics: $ for inline and $$ for display math.
      `;
    } else {
      // Standard prompt for other Gemini models
      prompt = `
      Please explain the following mathematical equation in detail:
      
      ${title ? `Title: ${title}` : 'Equation:'}
      
      LaTeX code: ${latex}
      
      Provide a clear, step-by-step explanation of this equation, including:
      1. What each variable or symbol represents
      2. The conceptual meaning of the equation
      3. How it relates to the broader context (${title?.split(' - ')[0] || 'physics/mathematics'})
      4. If applicable, a simple example applying this equation
      
      Format the response using HTML paragraphs and include appropriate mathematical notation using LaTeX wrapped in $ symbols for inline math and $$ for display math.
      `;
    }
    
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    
    // Format the response as HTML
    let formattedExplanation = text;
    
    // If the response doesn't contain HTML paragraph tags, wrap it
    if (!formattedExplanation.includes('<p>')) {
      formattedExplanation = formattedExplanation
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');
      formattedExplanation = `<p>${formattedExplanation}</p>`;
    }
    
    return formattedExplanation;
  } catch (error) {
    console.error('Error generating explanation with Gemini:', error);
    return null;
  }
}

module.exports = { geminiModel, generateExplanationWithGemini };
