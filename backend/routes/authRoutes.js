/**
 * routes/authRoutes.js
 *
 * Maps URL paths to auth controller functions.
 * All auth-related API endpoints live under /api/auth
 */

const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes — no token required
router.post('/register', register);
router.post('/login', login);

// Protected route — requires valid JWT
router.get('/profile', protect, getProfile);

module.exports = router;
