/**
 * routes/urlRoutes.js
 *
 * URL Intelligence API routes — all require authentication.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  analyzeUrl,
  getHistory,
  getStats,
  explainUrl,
  getReports,
  getReportById,
} = require('../controllers/urlController');

// All URL routes require a valid JWT
router.use(protect);

router.post('/analyze', analyzeUrl);
router.post('/explain', explainUrl);
router.get('/history', getHistory);
router.get('/stats', getStats);
router.get('/reports', getReports);
router.get('/reports/:scanId', getReportById);

module.exports = router;
