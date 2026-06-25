/**
 * server.js
 *
 * Main entry point for the PhishGuard AI backend.
 * Sets up Express server, middleware, routes, and database connection.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware — parse JSON request bodies
app.use(express.json());

// CORS — allow frontend to call this API from local dev and deployed hosts
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  // Local dev: Vite may use 5173, 5174, 5175, etc.
  if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
    return true;
  }

  // Render, Vercel, Netlify frontends
  if (
    /^https:\/\/[\w.-]+\.onrender\.com$/.test(origin) ||
    /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin) ||
    /^https:\/\/[\w.-]+\.netlify\.app$/.test(origin)
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Root — friendly response when visiting the API URL in a browser
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'PhishGuard AI API',
    status: 'running',
    version: '1.0.0',
    message: 'API is live. Use the PhishGuard frontend app — this URL is for API requests only.',
    documentation: 'https://github.com/KnightByte-IO/PhishGuard-AI',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      analyzeUrl: 'POST /api/url/analyze',
      threatIntel: 'POST /api/url/intelligence',
      explain: 'POST /api/url/explain',
    },
  });
});

// Health check — useful to verify server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PhishGuard API is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

const PORT = process.env.PORT || 5000;

/**
 * Start server only after MongoDB connects.
 * Prevents the API from accepting requests before the database is ready.
 */
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`PhishGuard server running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use. Stop the other server or change PORT in .env`
        );
      } else {
        console.error('Server error:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
