/**
 * routes/smsRoutes.js
 *
 * Routes for the SMS Analyzer feature.
 */

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeSms, getHistory } = require('../controllers/smsController');

const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeSms);
router.get('/history', getHistory);

module.exports = router;
