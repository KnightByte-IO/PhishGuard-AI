/**
 * routes/settingsRoutes.js
 *
 * Routes for user profile and password settings.
 */

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  updatePassword,
} = require('../controllers/settingsController');

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

module.exports = router;
