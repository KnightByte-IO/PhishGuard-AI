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

// Connect to MongoDB
connectDB();

const app = express();

// Middleware — parse JSON request bodies
app.use(express.json());

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

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PhishGuard server running on port ${PORT}`);
});
