/**
 * controllers/settingsController.js
 *
 * HTTP handlers for profile and password settings.
 */

const settingsService = require('../services/settingsService');

const getProfile = async (req, res) => {
  try {
    const profile = await settingsService.getProfileSettings(req.user._id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to load settings',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await settingsService.updateProfile(req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const result = await settingsService.updatePassword(req.user._id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update password',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
};
