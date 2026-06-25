/**
 * controllers/emailController.js
 *
 * HTTP handlers for the Email Analyzer feature.
 */

const emailAnalysisService = require('../services/emailAnalysisService');

const analyzeEmail = async (req, res) => {
  try {
    const scan = await emailAnalysisService.analyzeEmail(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Email analyzed successfully',
      data: scan,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to analyze email',
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await emailAnalysisService.getEmailHistory(req.user._id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch email history',
    });
  }
};

module.exports = {
  analyzeEmail,
  getHistory,
};
