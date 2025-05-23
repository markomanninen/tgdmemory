// gemini-integration.js - Google Gemini API integration for equation explanations

// Initialize the Gemini client with your API key
let geminiModel;
let genAI;
let GoogleGenAI;

// Dynamically import the ES module and initialize
async function initializeGemini() {
  if (process.env.GOOGLE_API_KEY && !GoogleGenAI) {
    try {
      const module = await import('@google/genai');
      GoogleGenAI = module.GoogleGenAI;
      genAI = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });
      
      // Use only the model specified in the environment variable
      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-preview-05-20";
      
      console.log(`Initializing Gemini model: ${modelName}`);
      geminiModel = modelName;
      console.log(`Successfully initialized Gemini model: ${modelName}`);
    } catch (error) {
      console.error(`Failed to initialize Gemini:`, error.message);
      console.error('Equation explanations with Gemini will not work. Check your GEMINI_MODEL configuration.');
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
    // Initialize Gemini if not already done
    await initializeGemini();
    
    if (!geminiModel || !genAI) {
      throw new Error('Gemini model not initialized. Please set GOOGLE_API_KEY.');
    }
    
    console.log('Generating explanation with Gemini for:', title || 'Untitled equation');
    
    // Customize the prompt based on the model being used
    let prompt;
    
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
    
    const result = await genAI.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'system',
          parts: [{ text: systemMessage }]
        },
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
    
    // Format the response as HTML
    let formattedExplanation = text;
    
    // Clean up any HTML, head, title, body tags from the response
    formattedExplanation = formattedExplanation
      .replace(/<\/?html>/gi, '')
      .replace(/<\/?head>/gi, '')
      .replace(/<\/?title>.*?<\/title>/gi, '')
      .replace(/<\/?body>/gi, '')
      .replace(/<h1>.*?<\/h1>/gi, '')  // Remove h1 headings which might contain the title
      .replace(/<h2>.*?<\/h2>/gi, ''); // Remove h2 headings which might contain the title
    
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

module.exports = { geminiModel, generateExplanationWithGemini, initializeGemini };
