/**
 * controllers/urlController.js
 *
 * HTTP handlers for URL analysis API endpoints.
 * Validates requests and delegates logic to urlAnalysisService.
 */

const urlAnalysisService = require('../services/urlAnalysisService');
const urlExplanationService = require('../services/urlExplanationService');
const threatIntelligenceService = require('../services/threatIntelligenceService');

/**
 * POST /api/url/analyze
 * Analyze a URL and store the result (protected).
 *
 * Body: { url: "https://example.com" }
 */
const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    const scan = await urlAnalysisService.analyzeUrl(req.user._id, url);

    res.status(201).json({
      success: true,
      message: 'URL analyzed successfully',
      data: scan,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to analyze URL',
    });
  }
};

/**
 * GET /api/url/history
 * Returns the user's past URL scans (protected).
 */
const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const history = await urlAnalysisService.getScanHistory(req.user._id, limit);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch scan history',
    });
  }
};

/**
 * GET /api/url/stats
 * Dashboard statistics: totals, high risk count, recent scans (protected).
 */
const getStats = async (req, res) => {
  try {
    const [stats, threatData] = await Promise.all([
      urlAnalysisService.getScanStats(req.user._id),
      urlExplanationService.getThreatDashboardData(req.user._id),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        ...threatData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch scan statistics',
    });
  }
};

/**
 * POST /api/url/explain
 * Generate AI threat explanation for an existing scan (protected).
 *
 * Flow: Fetch Scan → Send to Gemini → Store → Return
 * Body: { scanId: "..." }
 */
const explainUrl = async (req, res) => {
  try {
    const { scanId } = req.body;

    if (!scanId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a scanId',
      });
    }

    const result = await urlExplanationService.explainScan(req.user._id, scanId);

    res.status(200).json({
      success: true,
      message: result.aiAvailable
        ? 'AI threat explanation generated'
        : result.aiError,
      data: result.scan,
      aiAvailable: result.aiAvailable,
      aiError: result.aiError || null,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to generate explanation',
    });
  }
};

/**
 * GET /api/url/reports
 * List all threat reports for the logged-in user.
 */
const getReports = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const reports = await urlExplanationService.getThreatReports(
      req.user._id,
      limit
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch threat reports',
    });
  }
};

/**
 * GET /api/url/reports/:scanId
 * Get a single threat report by scan ID.
 */
const getReportById = async (req, res) => {
  try {
    const report = await urlExplanationService.getThreatReport(
      req.user._id,
      req.params.scanId
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch threat report',
    });
  }
};

/**
 * POST /api/url/intelligence
 * Run full threat intelligence scan on an existing URL scan (protected).
 *
 * Flow: Fetch Scan → Query all APIs in parallel → Aggregate → Store → Return
 * Body: { scanId: "..." }
 */
const runIntelligence = async (req, res) => {
  try {
    const { scanId } = req.body;

    if (!scanId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a scanId',
      });
    }

    const result = await threatIntelligenceService.runThreatIntelligence(
      req.user._id,
      scanId
    );

    res.status(200).json({
      success: true,
      message: 'Threat intelligence scan completed',
      data: result.scan,
      aggregated: result.aggregated,
      sourcesAvailable: result.sourcesAvailable,
      sourcesFailed: result.sourcesFailed,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Threat intelligence scan failed',
    });
  }
};

module.exports = {
  analyzeUrl,
  getHistory,
  getStats,
  explainUrl,
  getReports,
  getReportById,
  runIntelligence,
};
