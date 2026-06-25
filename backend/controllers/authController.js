/**
 * controllers/authController.js
 *
 * Handles HTTP request/response for authentication endpoints.
 * Delegates business logic to authService.
 */

const authService = require('../services/authService');

/**
 * POST /api/auth/register
 *
 * Creates a new user account.
 *
 * Request body: { name, email, password }
 * Response: { success, message, data: { user, token } }
 *
 * Flow:
 * 1. Client sends name, email, password
 * 2. Server validates and hashes password
 * 3. User saved to MongoDB
 * 4. JWT returned so client can stay logged in
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

/**
 * POST /api/auth/login
 *
 * Authenticates existing user and returns JWT.
 *
 * Request body: { email, password }
 * Response: { success, message, data: { user, token } }
 *
 * Flow:
 * 1. Client sends email and password
 * 2. Server finds user and compares hashed password
 * 3. If valid, JWT is generated and returned
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

/**
 * GET /api/auth/profile
 *
 * Returns logged-in user's profile (protected route).
 *
 * Headers: Authorization: Bearer <token>
 * Response: { success, data: { user } }
 *
 * Flow:
 * 1. authMiddleware verifies JWT and sets req.user
 * 2. Controller returns user info (no password)
 */
const getProfile = async (req, res) => {
  try {
    const profile = await authService.getUserProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: { user: profile },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
