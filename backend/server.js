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
const emailRoutes = require('./routes/emailRoutes');
const smsRoutes = require('./routes/smsRoutes');
const screenshotRoutes = require('./routes/screenshotRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware — parse JSON request bodies
// Increased limit so screenshot images can be sent as base64 safely.
app.use(express.json({ limit: '10mb' }));

// CORS — allow frontend (React) to call this API from a different port
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

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
app.use('/api/email', emailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/screenshot', screenshotRoutes);
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
