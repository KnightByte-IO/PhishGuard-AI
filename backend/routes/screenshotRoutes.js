/**
 * routes/screenshotRoutes.js
 *
 * Routes for screenshot-based phishing analysis.
 */

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  analyzeScreenshot,
  getHistory,
} = require('../controllers/screenshotController');

const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeScreenshot);
router.get('/history', getHistory);

module.exports = router;
