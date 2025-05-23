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

// Middleware - Allow all origins in development
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

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

// Direct cache access endpoint
app.get('/cache/:cacheKey', async (req, res) => {
  try {
    const { cacheKey } = req.params;
    
    if (!cacheKey) {
      return res.status(400).json({ error: 'Cache key is required' });
    }
    
    console.log(`Cache request for key: ${cacheKey}`);
    
    // Try to read from the public cache directory
    try {
      const publicCacheFilePath = path.join(publicCachePath, `${cacheKey}.json`);
      const publicCachedData = await fs.readFile(publicCacheFilePath, 'utf8');
      
      try {
        const parsedData = JSON.parse(publicCachedData);
        console.log('Returning cached explanation from public cache');
        // Set appropriate cache headers - allow client caching for 1 day
        res.set('Cache-Control', 'public, max-age=86400');
        res.set('Content-Type', 'application/json');
        return res.json(parsedData);
      } catch (parseError) {
        console.error('Error parsing public cache file:', parseError);
        return res.status(500).json({ error: 'Invalid cache file format' });
      }
    } catch (publicCacheError) {
      // No cache found in public cache
      console.log('No cache found for key:', cacheKey);
      // Add special cache headers to prevent false positives
      res.set('Cache-Control', 'no-store');
      res.set('Content-Type', 'application/json');
      return res.status(404).json({ error: 'Cache not found', cacheKey });
    }
  } catch (error) {
    console.error('Error in /cache/:cacheKey endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate a consistent cache key
function generateCacheKey(latex, title) {
  try {
    const input = latex + (title || '');
    
    // Convert to UTF-8 bytes and create full hex representation
    const fullHex = Buffer.from(input).toString('hex');
    
    // Create a more distinctive hash that considers the full equation content
    const hashLength = fullHex.length;
    
    // Take parts from different sections to ensure uniqueness
    const prefix = fullHex.substring(0, 4); // Beginning of equation (common part)
    const middle = hashLength > 20 ? 
      fullHex.substring(Math.floor(hashLength / 2) - 4, Math.floor(hashLength / 2) + 4) : // Middle of equation (unique part)
      fullHex.substring(4, Math.min(12, hashLength - 4));
    const suffix = fullHex.substring(Math.max(0, hashLength - 4)); // End of equation + title
    
    // Combine the parts to create a 16-character hash
    return prefix + middle + suffix;
  } catch (error) {
    console.error('Error generating cache key:', error);
    // Fallback to simple substring in case of error
    return Buffer.from(input).toString('hex').substring(0, 16);
  }
}

// Helper function to save an explanation to cache
async function saveToCache(cacheKey, explanation) {
  try {
    // Save to public cache directory for direct frontend access
    // ensurePublicCacheDir() is called at server startup, so the directory should exist.
    // We can add an explicit mkdir here for robustness if desired, but it might be redundant.
    // await fs.mkdir(publicCachePath, { recursive: true }); 
    const publicFilePath = path.join(publicCachePath, `${cacheKey}.json`);
    await fs.writeFile(publicFilePath, JSON.stringify({ explanation }));
    console.log(`Cached explanation at ${publicFilePath} (public cache)`);
    
    return true;
  } catch (error) {
    console.error('Error saving to public cache:', error);
    return false;
  }
}

// Debug endpoint for checking cache state
app.get('/debug/cache', async (req, res) => {
  try {
    const publicCacheDir = publicCachePath;
    
    // Check if directory exists
    const publicDirExists = await fs.stat(publicCacheDir).then(() => true).catch(() => false);
    
    // Read directory contents if it exists
    let publicFiles = [];
    
    if (publicDirExists) {
      publicFiles = await fs.readdir(publicCacheDir);
    }
    
    // Return debug information
    res.json({
      cacheDirectories: {
        public: {
          path: publicCacheDir,
          exists: publicDirExists,
          fileCount: publicFiles.length,
          files: publicFiles.slice(0, 10) // Show only first 10 files
        }
      },
      serverInfo: {
        port: PORT,
        nodeEnv: process.env.NODE_ENV || 'development',
        publicPath: path.join(__dirname, '..', 'public'),
        publicPathExists: await fs.stat(path.join(__dirname, '..', 'public')).then(() => true).catch(() => false)
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: 'Error retrieving cache debug information' });
  }
});

// Primary explanation endpoint using OpenAI
app.post('/api/explain', async (req, res) => {
  try {
    const { latex, title } = req.body;
    
    if (!latex) {
      return res.status(400).json({ error: 'LaTeX equation is required' });
    }

    // Generate a simple hash key for caching
    const cacheKey = generateCacheKey(latex, title);
    
    // Check if we have a cached explanation
    try {
      const cacheFilePath = path.join(publicCachePath, `${cacheKey}.json`);
      const cachedData = await fs.readFile(cacheFilePath, 'utf8');
      const { explanation } = JSON.parse(cachedData);
      
      if (explanation) {
        console.log('Returning cached explanation from public cache');
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

    // Generate a consistent hash key for caching with the gemini prefix
    const cacheKey = generateCacheKey(`gemini-${latex}`, title);
    
    // Check if we have a cached explanation
    try {
      const cacheFilePath = path.join(publicCachePath, `${cacheKey}.json`);
      const cachedData = await fs.readFile(cacheFilePath, 'utf8');
      const { explanation } = JSON.parse(cachedData);
      
      if (explanation) {
        console.log('Returning cached Gemini explanation from public cache');
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
  console.log(`- Cache directory (served from public): ${publicCachePath}`);

  // server.js - inside app.listen, for temporary key generation
  const tempLatex1 = "\\sigma_1";
  const tempTitle1 = "Sigma One";
  const tempKey1 = generateCacheKey(tempLatex1, tempTitle1);
  console.log(`DEV_ONLY_KEY_1 for (${tempLatex1}, ${tempTitle1}): ${tempKey1}`);

  const tempLatex2 = "\\alpha_2";
  const tempTitle2 = "Alpha Two";
  const tempKey2 = generateCacheKey(tempLatex2, tempTitle2);
  console.log(`DEV_ONLY_KEY_2 for (${tempLatex2}, ${tempTitle2}): ${tempKey2}`);
  // End of temporary snippet
  
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
