/**
 * services/urlExplanationService.js
 *
 * Orchestrates the AI explanation flow:
 *   1. Fetch scan from database
 *   2. Send scan report to Gemini
 *   3. Store explanation on the scan document
 *   4. Return combined result (rule-based + AI)
 *
 * If Gemini fails, the rule-based scan is still returned.
 */

const UrlScan = require('../models/UrlScan');
const geminiThreatService = require('./geminiThreatService');

/**
 * Generate and store AI explanation for an existing URL scan.
 *
 * @param {string} userId - Logged-in user's ID
 * @param {string} scanId - MongoDB _id of the UrlScan document
 * @returns {Object} { scan, aiAvailable, aiError? }
 */
const explainScan = async (userId, scanId) => {
  const scan = await UrlScan.findOne({ _id: scanId, userId });

  if (!scan) {
    const error = new Error('Scan not found');
    error.statusCode = 404;
    throw error;
  }

  try {
    const explanation = await geminiThreatService.generateThreatExplanation(scan);

    scan.summary = explanation.summary;
    scan.attackType = explanation.attackType;
    scan.aiReasons = explanation.reasons;
    scan.recommendations = explanation.recommendations;
    scan.securityTips = explanation.securityTips;
    scan.aiGenerated = true;
    scan.aiGeneratedAt = new Date();

    await scan.save();

    return {
      scan,
      aiAvailable: true,
    };
  } catch (error) {
    console.error('Gemini explanation failed:', error.message);

    return {
      scan,
      aiAvailable: false,
      aiError: 'AI explanation unavailable.',
    };
  }
};

/**
 * Get a single threat report by scan ID.
 */
const getThreatReport = async (userId, scanId) => {
  const scan = await UrlScan.findOne({ _id: scanId, userId }).select('-__v');

  if (!scan) {
    const error = new Error('Threat report not found');
    error.statusCode = 404;
    throw error;
  }

  return scan;
};

/**
 * List threat reports for the Threat Reports page.
 * Returns scans sorted by date (newest first).
 */
const getThreatReports = async (userId, limit = 20) => {
  return UrlScan.find({ userId })
    .sort({ analysisDate: -1 })
    .limit(limit)
    .select('-__v');
};

/**
 * Dashboard AI widgets: latest report, most common threat, recent explanations.
 */
const getThreatDashboardData = async (userId) => {
  const [latestReport, aiReports, allWithAttackType] = await Promise.all([
    UrlScan.findOne({ userId }).sort({ analysisDate: -1 }).select('-__v'),
    UrlScan.find({ userId, aiGenerated: true })
      .sort({ aiGeneratedAt: -1 })
      .limit(5)
      .select('originalUrl riskScore riskLevel attackType summary aiGeneratedAt analysisDate'),
    UrlScan.find({ userId, aiGenerated: true, attackType: { $ne: null } })
      .select('attackType'),
  ]);

  // Count attack types to find the most common
  const attackCounts = {};
  allWithAttackType.forEach((scan) => {
    if (scan.attackType) {
      attackCounts[scan.attackType] = (attackCounts[scan.attackType] || 0) + 1;
    }
  });

  let mostCommonThreat = null;
  let maxCount = 0;
  Object.entries(attackCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonThreat = { attackType: type, count };
    }
  });

  return {
    latestThreatReport: latestReport,
    mostCommonThreat,
    recentAiExplanations: aiReports,
  };
};

module.exports = {
  explainScan,
  getThreatReport,
  getThreatReports,
  getThreatDashboardData,
};
