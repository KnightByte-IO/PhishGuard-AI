/**
 * routes/emailRoutes.js
 *
 * Routes for the Email Analyzer feature.
 */

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeEmail, getHistory } = require('../controllers/emailController');

const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeEmail);
router.get('/history', getHistory);

module.exports = router;
