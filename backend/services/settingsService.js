/**
 * services/settingsService.js
 *
 * Handles user profile and password updates.
 */

const User = require('../models/User');

const getProfileSettings = async (userId) => {
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

const updateProfile = async (userId, { name, email }) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email is already in use');
      error.statusCode = 400;
      throw error;
    }
  }

  user.name = name?.trim() || user.name;
  user.email = email?.trim().toLowerCase() || user.email;
  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

const updatePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const matches = await user.matchPassword(currentPassword);
  if (!matches) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

module.exports = {
  getProfileSettings,
  updateProfile,
  updatePassword,
};
