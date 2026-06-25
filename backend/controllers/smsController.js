/**
 * controllers/smsController.js
 *
 * HTTP handlers for the SMS Analyzer feature.
 */

const smsAnalysisService = require('../services/smsAnalysisService');

const analyzeSms = async (req, res) => {
  try {
    const scan = await smsAnalysisService.analyzeSms(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'SMS analyzed successfully',
      data: scan,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to analyze SMS',
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await smsAnalysisService.getSmsHistory(req.user._id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch SMS history',
    });
  }
};

module.exports = {
  analyzeSms,
  getHistory,
};
