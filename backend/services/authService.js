/**
 * services/authService.js
 *
 * Business logic for authentication.
 * Controllers call these functions — keeps routes thin and logic reusable.
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user.
 *
 * @param {Object} userData - { name, email, password }
 * @returns {Object} { user, token }
 */
const registerUser = async ({ name, email, password }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  // Create user (password gets hashed by pre-save hook in User model)
  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Login existing user with email and password.
 *
 * @param {Object} credentials - { email, password }
 * @returns {Object} { user, token }
 */
const loginUser = async ({ email, password }) => {
  // Must explicitly select password since it's hidden by default
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Get user profile by ID (for protected profile route).
 *
 * @param {string} userId
 * @returns {Object} User profile without password
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
