// server.js - Backend for equation explanation
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Added Mongoose
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');


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
const { generateExplanationWithGemini, initializeGemini } = require('./gemini-integration');
const Comment = require('./models/Comment');
const User = require('./models/User'); // Make sure User model is imported
console.log('API integrations imported');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Configure Express to trust proxy - required when behind a reverse proxy like Nginx
// This allows express-rate-limit to use X-Forwarded-For header for client IP
app.set('trust proxy', 1);

// Configure logging
const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tgdmemory-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (!isProd) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Handle log rotation signals in production
if (isProd) {
  process.on('SIGUSR1', () => {
    logger.info('Received SIGUSR1 signal, rotating logs...');
    
    // Close and reopen log files
    logger.clear();
    logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
    logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
    
    logger.info('Log rotation completed');
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  // Close database connection
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

// Function to initialize database with admin user
const initializeDatabase = async () => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ roles: { $in: ['admin'] } });
    
    if (!existingAdmin) {
      console.log('No admin user found. Creating default admin user...');
      
      // Get admin credentials from environment or use defaults
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@openscience.center';
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      // Create default admin user
      const adminUser = new User({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save hook
        roles: ['admin']
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`👤 Username: ${adminUsername}`);
      console.log('🔑 Password: [Set via ADMIN_PASSWORD env var or default]');
      console.log('⚠️  IMPORTANT: Change the admin password after first login!');
      
      logger.info('Default admin user created successfully');
    } else {
      console.log('Admin user already exists, skipping creation.');
      logger.info('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    logger.error('Error initializing database:', error);
  }
};

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      logger.info('MongoDB connected successfully.');
      console.log('MongoDB connected successfully.');
      
      // Initialize database with admin user
      await initializeDatabase();
    })
    .catch(err => {
      logger.error('MongoDB connection error:', err);
      console.error('MongoDB connection error:', err);
    });
} else {
  const message = 'MONGODB_URI environment variable is not set. Cannot connect to database.';
  logger.error(message);
  console.error(message);
}

// Production middleware
if (isProd) {
  // Use Helmet for security headers
  // Note: Disable HSTS and upgrade-insecure-requests for Docker containers that may be accessed via HTTP
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'", "http:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        fontSrc: ["'self'", "data:", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        connectSrc: ["'self'", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        workerSrc: ["'self'", "blob:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        // Note: blockAllMixedContent has been removed as it's deprecated in CSP Level 3
        // Explicitly disable upgrading HTTP to HTTPS
        upgradeInsecureRequests: null
      },
    },
    // Disable HSTS (Strict-Transport-Security) to allow HTTP access
    hsts: false,
    // Do not force HTTPS for referrer policy
    referrerPolicy: { policy: 'no-referrer-when-downgrade' }
  }));
  
  // Enable compression
  app.use(compression());
  
  // HTTP request logging
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
} else {
  // Development logging
  app.use(morgan('dev'));
  
  // Apply basic helmet CSP in development mode too
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'", "http:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        fontSrc: ["'self'", "data:", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        connectSrc: ["'self'", "http:", "https:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        workerSrc: ["'self'", "blob:", "cdn.jsdelivr.net", "*.jsdelivr.net"],
        upgradeInsecureRequests: null
      },
    },
    // Disable HSTS in development too
    hsts: false
  }));
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for OPTIONS (preflight) requests
  skip: (req) => req.method === 'OPTIONS'
});

// Special test limiter with much lower limits for testing rate limiting functionality
const testLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute
  message: {
    error: 'Rate limit reached during testing.',
    retryAfter: 60 // 1 minute in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 5 : 50, // Limit each IP to 5 auth attempts per windowMs in production
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for OPTIONS (preflight) requests
  skip: (req) => req.method === 'OPTIONS'
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Configure CORS based on environment
const corsOptions = isProd ? {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
} : {
  origin: [
    // Monitoring dashboard
    'http://localhost:3030', 
    'https://localhost:3030',
    // Main app server
    'http://localhost:3000', 
    'https://localhost:3000',
    // Vite dev server (default port)
    'http://localhost:5173',
    'https://localhost:5173',
    // Direct localhost access
    'http://localhost', 
    'https://localhost',
    // IPv4 localhost
    'http://127.0.0.1:3030',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://127.0.0.1:3030',
    'https://127.0.0.1:3000',
    'https://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // Limit payload size

// Legacy security headers (kept for compatibility, helmet handles most of these)
if (isProd) {
  app.use((req, res, next) => {
    // Additional custom headers if needed
    res.setHeader('X-Powered-By', 'TGD Memory'); // Custom server identifier
    next();
  });
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: isProd ? '1d' : 0 // Use caching in production
}));

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
app.post('/api/auth/register', authLimiter, async (req, res) => {
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
app.post('/api/auth/login', authLimiter, async (req, res) => {
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

// Simple spam detection function
const detectSpam = (text, authorName = '') => {
  const spamPatterns = [
    /https?:\/\/[^\s]+/gi, // URLs
    /\b(buy|sell|click|free|money|earn|casino|poker|viagra|cialis)\b/gi, // Common spam words
    /(.)\1{4,}/gi, // Repeated characters (4+ times)
    /[A-Z]{5,}/g, // All caps words (5+ chars)
  ];
  
  const text_lower = text.toLowerCase();
  const name_lower = authorName.toLowerCase();
  
  // Check for spam patterns
  for (let pattern of spamPatterns) {
    if (pattern.test(text) || pattern.test(authorName)) {
      return true;
    }
  }
  
  // Check for excessive length
  if (text.length > 2000) return true;
  
  // Check for suspicious author names
  if (authorName.length > 50) return true;
  
  return false;
};

// POST /api/comments - Create a new comment (supports both authenticated and anonymous users)
app.post('/api/comments', async (req, res) => {
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

    // Basic spam detection
    if (detectSpam(commentText, authorDisplayName)) {
      return res.status(400).json({ error: 'Comment flagged as potential spam.' });
    }

    // Check if user is authenticated (optional)
    const authHeader = req.headers.authorization;
    let user = null;
    let isAuthenticated = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.user.id); // Fixed: use decoded.user.id
        isAuthenticated = true;
      } catch (err) {
        // Token is invalid, treat as anonymous
        isAuthenticated = false;
      }
    }

    // Construct the comment object
    const commentData = {
      pageUrl,
      commentText,
      selectedText: selectedText || null,
      selectionDetails: selectionDetails || null,
      authorDisplayName: isAuthenticated ? (user?.username || 'User') : (authorDisplayName || 'Anonymous'),
      userId: isAuthenticated ? user?._id : null,
      userGroup: userGroup || 'general', // Default to 'general' instead of 'public'
      // Anonymous comments require approval, authenticated user comments are auto-approved
      status: isAuthenticated ? 'approved' : 'pending_approval'
    };

    // Only authenticated users can make private comments
    if (isAuthenticated && isPrivate !== undefined) {
      commentData.isPrivate = isPrivate;
    } else {
      commentData.isPrivate = false;
    }

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


// Health check endpoints
app.get('/api/ping', testLimiter, (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Comprehensive health check endpoint
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {}
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.services.mongodb = { status: 'connected', connection: 'healthy' };
    } else {
      healthCheck.services.mongodb = { 
        status: 'disconnected', 
        connection: 'unhealthy',
        readyState: mongoose.connection.readyState 
      };
      healthCheck.status = 'degraded';
    }

    // Check cache directory
    try {
      await fs.access(publicCachePath);
      healthCheck.services.cache = { status: 'accessible', path: publicCachePath };
    } catch (error) {
      healthCheck.services.cache = { status: 'inaccessible', error: error.message };
      healthCheck.status = 'degraded';
    }

    // Check API integrations (basic availability check)
    healthCheck.services.openai = { 
      configured: !!process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    };
    
    healthCheck.services.gemini = { 
      configured: !!process.env.GOOGLE_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-pro'
    };

    res.status(healthCheck.status === 'ok' ? 200 : 503).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Readiness probe (for container orchestration)
app.get('/api/ready', async (req, res) => {
  try {
    // Check if the server is ready to accept traffic
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Database connection not established',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'ready',
      message: 'Server is ready to accept traffic',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      message: 'Server readiness check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe (for container orchestration)
app.get('/api/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    message: 'Server is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
