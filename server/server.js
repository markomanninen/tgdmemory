// server.js - Backend for equation explanation
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
console.log('Server starting - Loading environment variables...');
dotenv.config();
console.log('Environment loaded - Checking key variables:');
console.log('PORT:', process.env.PORT || '3000 (default)');
console.log('OPENAI_API_KEY exists:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('GOOGLE_API_KEY exists:', process.env.GOOGLE_API_KEY ? 'Yes' : 'No');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || 'Not set (will use default)');
console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL || 'Not set (will use default)');

// Import integrations after environment is loaded
console.log('Importing API integrations...');
const { generateExplanationWithOpenAI } = require('./openai-integration');
const { generateExplanationWithGemini } = require('./gemini-integration');
console.log('API integrations imported');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the explanations-cache directory as static files
app.use('/explanations-cache', express.static(path.join(__dirname, 'explanations-cache')));

// Create a public path outside the server directory to make cache accessible by the front-end
const publicCachePath = path.join(__dirname, '..', 'public', 'explanations-cache');

// Helper function to ensure the public cache directory exists
async function ensurePublicCacheDir() {
  try {
    await fs.mkdir(publicCachePath, { recursive: true });
    console.log(`Public cache directory created at: ${publicCachePath}`);
  } catch (error) {
    console.error('Error creating public cache directory:', error);
  }
}

// Call this when the server starts
ensurePublicCacheDir();

// Helper function to save an explanation to cache
async function saveToCache(cacheKey, explanation) {
  try {
    // Save to server cache directory
    const cacheDir = path.join(__dirname, 'explanations-cache');
    const cacheFilePath = path.join(cacheDir, `${cacheKey}.json`);
    
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cacheFilePath, JSON.stringify({ explanation }));
    console.log(`Cached explanation at ${cacheFilePath}`);
    
    // Also save to public cache directory for direct frontend access
    const publicFilePath = path.join(publicCachePath, `${cacheKey}.json`);
    await fs.writeFile(publicFilePath, JSON.stringify({ explanation }));
    console.log(`Also cached explanation at ${publicFilePath} for frontend access`);
    
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
}

// Primary explanation endpoint using OpenAI
app.post('/api/explain', async (req, res) => {
  try {
    const { latex, title } = req.body;
    
    if (!latex) {
      return res.status(400).json({ error: 'LaTeX equation is required' });
    }

    // Generate a simple hash key for caching
    const cacheKey = Buffer.from(latex + (title || '')).toString('hex').substring(0, 16);
    
    // Check if we have a cached explanation
    try {
      const cacheFilePath = path.join(__dirname, 'explanations-cache', `${cacheKey}.json`);
      const cachedData = await fs.readFile(cacheFilePath, 'utf8');
      const { explanation } = JSON.parse(cachedData);
      
      if (explanation) {
        console.log('Returning cached explanation');
        return res.json({ explanation });
      }
    } catch (cacheError) {
      // No cache found, continue to generate a new explanation
    }

    // Generate explanation with OpenAI
    const explanation = await generateExplanationWithOpenAI(latex, title);
    
    if (explanation) {
      // Cache the explanation for future use
      await saveToCache(cacheKey, explanation);
      
      return res.json({ explanation });
    } else {
      return res.status(500).json({ error: 'Failed to generate explanation' });
    }
  } catch (error) {
    console.error('Error in /api/explain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback explanation endpoint using Google's Gemini API
app.post('/api/explain-with-gemini', async (req, res) => {
  try {
    const { latex, title } = req.body;
    
    if (!latex) {
      return res.status(400).json({ error: 'LaTeX equation is required' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(503).json({ error: 'Gemini API is not configured. Set GOOGLE_API_KEY environment variable.' });
    }

    // Generate a simple hash key for caching
    const cacheKey = Buffer.from(`gemini-${latex}-${title || ''}`).toString('hex').substring(0, 16);
    
    // Check if we have a cached explanation
    try {
      const cacheFilePath = path.join(__dirname, 'explanations-cache', `${cacheKey}.json`);
      const cachedData = await fs.readFile(cacheFilePath, 'utf8');
      const { explanation } = JSON.parse(cachedData);
      
      if (explanation) {
        console.log('Returning cached Gemini explanation');
        return res.json({ explanation });
      }
    } catch (cacheError) {
      // No cache found, continue to generate a new explanation
    }

    // Generate explanation with Gemini
    const explanation = await generateExplanationWithGemini(latex, title);
    
    if (explanation) {
      // Cache the explanation for future use
      await saveToCache(cacheKey, explanation);
      
      return res.json({ explanation });
    } else {
      return res.status(500).json({ error: 'Failed to generate explanation with Gemini' });
    }
  } catch (error) {
    console.error('Error in /api/explain-with-gemini:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Equation explanation server running on port ${PORT}`);
  console.log(`- Primary explanation endpoint: http://localhost:${PORT}/api/explain`);
  console.log(`- Fallback explanation endpoint: http://localhost:${PORT}/api/explain-with-gemini`);
  console.log(`- Cache directory: ${path.join(__dirname, 'explanations-cache')}`);
  console.log(`- Public cache directory: ${publicCachePath}`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not set. Primary API will not work.');
  } else {
    console.log(`- Using OpenAI model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo (default)'}`);
  }
  
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('Warning: GOOGLE_API_KEY not set. Gemini fallback will not work.');
  } else {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    console.log(`- Using Gemini model: ${modelName}`);
    
    // Check if using Gemini 2.5 Flash
    if (modelName.includes('2.5-flash')) {
      console.log('  ✓ Using the latest Gemini 2.5 Flash model for better mathematical explanations');
    } else {
      console.log('  ℹ️ Consider using the Gemini 2.5 Flash model for improved performance:');
      console.log('     Add GEMINI_MODEL=gemini-2.5-flash-preview-05-20 to your .env file');
      console.log('     Run "npm run check-models" to check model availability');
    }
  }
});
