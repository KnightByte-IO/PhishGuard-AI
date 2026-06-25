/**
 * controllers/screenshotController.js
 *
 * HTTP handlers for screenshot-based phishing analysis.
 */

const screenshotAnalysisService = require('../services/screenshotAnalysisService');

const analyzeScreenshot = async (req, res) => {
  try {
    const scan = await screenshotAnalysisService.analyzeUserScreenshot(
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Screenshot analyzed successfully',
      data: scan,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to analyze screenshot',
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await screenshotAnalysisService.getScreenshotHistory(
      req.user._id
    );
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch screenshot history',
    });
  }
};

module.exports = {
  analyzeScreenshot,
  getHistory,
};
