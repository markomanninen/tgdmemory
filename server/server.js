// server.js - Backend for equation explanation
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Added Mongoose
const jwt = require('jsonwebtoken');


// Load environment variables from .env file
console.log('Server starting - Loading environment variables...');
dotenv.config();
console.log('Environment loaded - Checking key variables:');
console.log('PORT:', process.env.PORT || '3000 (default)');
console.log('MONGODB_URI exists:', process.env.MONGODB_URI ? 'Yes' : 'No'); // Check for MONGODB_URI
console.log('OPENAI_API_KEY exists:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('GOOGLE_API_KEY exists:', process.env.GOOGLE_API_KEY ? 'Yes' : 'No');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || 'Not set (will use default)');
console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL || 'Not set (will use default)');

// Import integrations after environment is loaded
console.log('Importing API integrations...');
const { generateExplanationWithOpenAI } = require('./openai-integration');
const { generateExplanationWithGemini } = require('./gemini-integration');
const Comment = require('./models/Comment');
const User = require('./models/User'); // Make sure User model is imported
console.log('API integrations imported');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.error('MONGODB_URI is not defined in .env file. Cannot connect to database.');
}

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
    // console.log(`Public cache directory created at: ${publicCachePath}`); // Reduced logging
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
    const prefix = fullHex.substring(0, 4);
    const middle = hashLength > 20 ? 
      fullHex.substring(Math.floor(hashLength / 2) - 4, Math.floor(hashLength / 2) + 4) :
      fullHex.substring(4, Math.min(12, hashLength - 4));
    const suffix = hashLength > 8 ? fullHex.substring(hashLength - 4) : '';
    return `${prefix}${middle}${suffix}${hashLength}`.replace(/[^a-zA-Z0-9]/g, ''); // Sanitize

  } catch (error) {
    console.error('Error generating cache key:', error);
    throw new Error('Failed to generate cache key');
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
    const files = await fs.readdir(publicCachePath);
    res.json({ cacheFiles: files, count: files.length });
  } catch (error) {
    console.error('Error in /debug/cache endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      return res.status(400).json({ error: 'LaTeX string is required' });
    }

    const cacheKey = generateCacheKey(latex, title);
    const cacheFilePath = path.join(publicCachePath, `${cacheKey}.json`);

    try {
      const cachedExplanation = await fs.readFile(cacheFilePath, 'utf-8');
      console.log(`Serving explanation from cache for key: ${cacheKey} (Gemini fallback)`);
      return res.json(JSON.parse(cachedExplanation));
    } catch (error) {
      // Not in cache or error reading, proceed to generate
      console.log(`Cache miss for key: ${cacheKey} (Gemini fallback). Generating explanation...`);
    }

    const explanation = await generateExplanationWithGemini(latex, title);
    await saveToCache(cacheKey, explanation);
    res.json(explanation);
  } catch (error) {
    console.error('Error in /api/explain-with-gemini endpoint:', error);
    res.status(500).json({ error: 'Failed to generate explanation with Gemini', details: error.message });
  }
});

// --- Authentication Routes ---

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists.' });
    }

    const newUser = new User({
      username,
      email,
      password, // Password will be hashed by the pre-save hook in User model
      roles: roles || ['user'] // Default to 'user' if roles not provided
    });

    await newUser.save();

    // Respond with user info (excluding password)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'User registered successfully', user: userResponse });

  } catch (error) {
    console.error('Error during registration:', error);
    // Handle Mongoose validation errors more gracefully
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration.', details: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Password incorrect
    }

    // User matched, create JWT payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }, // Use from .env or default
      (err, token) => {
        if (err) throw err;
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({
          message: 'Login successful',
          token,
          user: userResponse
        });
      }
    );

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.', details: error.message });
  }
});

// Middleware to verify JWT and protect routes
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add user from payload to request object
    // Optionally, fetch the full user object from DB if needed for every authenticated request
    // req.userFull = await User.findById(decoded.user.id).select('-password');
    // if (!req.userFull) return res.status(401).json({ message: 'User not found.' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

// Middleware to authorize based on user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: 'Forbidden: No user roles found.' });
    }
    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: `Forbidden: User does not have required role(s) (${allowedRoles.join(', ')}).` });
    }
    next();
  };
};

// Example protected route: Get current authenticated user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    // req.user is available from authMiddleware
    // If you need the full user object and didn't fetch it in middleware:
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- User Management API Endpoints (Admin Only) ---

// GET /api/users - List all users (Admin only)
app.get('/api/users', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    // Optional: Add pagination query parameters (e.g., limit, skip)
    const { limit = 20, skip = 0, sortBy = 'createdAt', order = 'desc' } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1;

    const users = await User.find()
      .select('-password') // Exclude passwords from the result
      .sort({ [sortBy]: sortOrder })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments();

    res.json({
        users,
        totalUsers,
        currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
});

// PUT /api/users/:userId/roles - Update a user's roles (Admin only)
app.put('/api/users/:userId/roles', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body; // Expect an array of roles

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ message: 'Roles must be an array.' });
    }

    // Validate roles against the enum defined in the User model
    const possibleRoles = User.schema.path('roles').caster.enumValues;
    const invalidRoles = roles.filter(role => !possibleRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ message: `Invalid role(s): ${invalidRoles.join(', ')}. Valid roles are: ${possibleRoles.join(', ')}` });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from removing their own admin role if they are the only admin? (Optional advanced check)
    // For simplicity, this check is omitted here but can be important.

    user.roles = roles;
    user.updatedAt = Date.now(); // Manually update timestamp as it's not a default save operation
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'User roles updated successfully.', user: userResponse });
  } catch (error) {
    console.error('Error updating user roles:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating user roles.' });
  }
});

// --- Comment API Endpoints ---

// POST /api/comments - Create a new comment
app.post('/api/comments', authMiddleware, async (req, res) => {
  try {
    const {
      pageUrl,
      selectedText,
      selectionDetails,
      commentText,
      authorDisplayName, // Use this directly
      userGroup,          // To assign to a group
      isPrivate,          // For private notes
      tags,               // Array of tags
      parentId            // For replies
    } = req.body;

    if (!pageUrl || !commentText) {
      return res.status(400).json({ error: 'pageUrl and commentText are required.' });
    }

    // Construct the comment object, allowing Mongoose defaults to apply where values aren't provided
    const commentData = {
      pageUrl,
      commentText,
      selectedText: selectedText || null,
      selectionDetails: selectionDetails || null,
      authorDisplayName: authorDisplayName || req.user.username || 'Anonymous', // Use authenticated username if available
      userId: req.user.id, // Get userId from the authenticated user
      // userGroup will use model default 'public' if undefined and not explicitly passed
      // status will use the model default (e.g., 'approved' or 'pending_approval')
    };

    // Only set these if they are explicitly passed to avoid overriding model defaults with undefined
    if (userGroup !== undefined) commentData.userGroup = userGroup;
    if (isPrivate !== undefined) commentData.isPrivate = isPrivate;
    if (tags !== undefined) commentData.tags = tags;
    if (parentId !== undefined) commentData.parentId = parentId;


    const newComment = new Comment(commentData);

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment', details: error.message });
  }
});

// GET /api/comments - Fetch comments for a page
app.get('/api/comments', async (req, res) => {
  try {
    const { pageUrl, userId, targetUserGroup, tag } = req.query; // Added userId, targetUserGroup, tag for filtering

    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter is required.' });
    }

    const queryConditions = {
      pageUrl,
      status: 'approved', // Default to fetching only approved comments
    };

    // Base query for public comments in the specified group or the default 'public' group
    const publicCommentsClause = {
      userGroup: targetUserGroup || 'public',
      isPrivate: false,
      status: 'approved' // Ensure status is part of each clause
    };

    if (userId) {
      // If a userId is provided, fetch:
      // 1. Approved public comments in the targetUserGroup (or 'public')
      // 2. The user's own private comments for this pageUrl (approved)
      // 3. The user's own non-private comments, regardless of group, if they are approved.
      queryConditions.$or = [
        publicCommentsClause,
        { userId, isPrivate: true, status: 'approved', pageUrl }, // User's private comments
        { userId, isPrivate: false, status: 'approved', pageUrl } // User's own public/group comments
      ];
      // Remove pageUrl from top level as it's in each $or clause now for clarity
      delete queryConditions.pageUrl;
      // Remove status from top level as it's in each $or clause now
      delete queryConditions.status;

    } else {
      // For anonymous users, only fetch approved public comments in the targetUserGroup (or 'public')
      queryConditions.userGroup = targetUserGroup || 'public';
      queryConditions.isPrivate = false;
    }
    
    // If a specific tag is provided, filter by it
    if (tag) {
      // If queryConditions.$or exists, add tags to each clause, else add to top level
      if (queryConditions.$or) {
        queryConditions.$or.forEach(condition => condition.tags = tag);
      } else {
        queryConditions.tags = tag;
      }
    }
    
    const comments = await Comment.find(queryConditions)
      .sort({ createdAt: 1 }) // Sort by oldest first
      // .populate('userId', 'authorDisplayName') // Future: when User model exists
      // .populate('parentId') // Future: if you want to nest/hydrate replies server-side
      ; 
      
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
  }
});

// --- Admin API Endpoints for Comments ---
// IMPORTANT: In a production environment, these endpoints MUST be protected by authentication
// and authorization middleware to ensure only administrators can access them.

// GET /api/comments/admin - Fetch comments for admin review (e.g., pending, flagged)
app.get('/api/comments/admin', authMiddleware, authorizeRoles('admin', 'editor', 'reviewer'), async (req, res) => {
  try {
    const { status, pageUrl, userGroup, sortBy = 'createdAt', order = 'desc', limit = 20, skip = 0 } = req.query;
    const queryConditions = {};

    if (status) queryConditions.status = status;
    if (pageUrl) queryConditions.pageUrl = pageUrl;
    if (userGroup) queryConditions.userGroup = userGroup;
    // If no status is provided, admins might want to see all non-archived comments
    // or you might require a status. For now, it fetches based on what's provided.

    const sortOrder = order === 'asc' ? 1 : -1;
    const comments = await Comment.find(queryConditions)
      .sort({ [sortBy]: sortOrder })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
      // .populate('userId', 'username email'); // Future: populate user details

    const totalComments = await Comment.countDocuments(queryConditions);

    res.status(200).json({ 
      comments,
      totalComments,
      currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(totalComments / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching comments for admin:', error);
    res.status(500).json({ error: 'Failed to fetch comments for admin', details: error.message });
  }
});

// PUT /api/comments/admin/:commentId/status - Update a comment's status
app.put('/api/comments/admin/:commentId/status', authMiddleware, authorizeRoles('admin', 'editor', 'reviewer'), async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;

    if (!status || !Comment.schema.path('status').enumValues.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required.' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { status: status, updatedAt: Date.now() } },
      { new: true } // Return the updated document
    );

    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({ error: 'Failed to update comment status', details: error.message });
  }
});

// PUT /api/comments/admin/:commentId - Admin edit a comment's content
app.put('/api/comments/admin/:commentId', authMiddleware, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const { commentId } = req.params;
    const { commentText, selectedText, selectionDetails, tags, isPrivate, userGroup } = req.body;

    const updateData = { updatedAt: Date.now() };
    if (commentText !== undefined) updateData.commentText = commentText;
    if (selectedText !== undefined) updateData.selectedText = selectedText;
    if (selectionDetails !== undefined) updateData.selectionDetails = selectionDetails;
    if (tags !== undefined) updateData.tags = tags;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (userGroup !== undefined) updateData.userGroup = userGroup;
    // Add other fields an admin might be allowed to edit

    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
        return res.status(400).json({ error: 'No update fields provided.' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error updating comment (admin):', error);
    res.status(500).json({ error: 'Failed to update comment', details: error.message });
  }
});

// DELETE /api/comments/admin/:commentId - Admin delete a comment
app.delete('/api/comments/admin/:commentId', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    res.status(200).json({ message: 'Comment deleted successfully.', deletedComment });
  } catch (error) {
    console.error('Error deleting comment (admin):', error);
    res.status(500).json({ error: 'Failed to delete comment', details: error.message });
  }
});


// Simple ping endpoint for health checks
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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
