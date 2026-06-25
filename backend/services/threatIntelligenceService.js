/**
 * services/threatIntelligenceService.js
 *
 * Orchestrates the full Threat Intelligence Engine.
 *
 * Flow:
 *   1. Fetch existing URL scan (rule-based results)
 *   2. Run VirusTotal, WHOIS, Safe Browsing, URLScan in parallel
 *   3. Each service fails gracefully — others continue
 *   4. Aggregate all results into final risk score + confidence
 *   5. Store everything on the scan document
 */

const UrlScan = require('../models/UrlScan');
const virusTotalService = require('./virusTotalService');
const whoisService = require('./whoisService');
const safeBrowsingService = require('./safeBrowsingService');
const urlScanService = require('./urlScanService');
const { aggregateThreats } = require('./threatAggregator');

/**
 * Run all threat intelligence sources in parallel with graceful failure.
 */
const runIntelligenceSources = async (scan) => {
  const url = scan.normalizedUrl || scan.originalUrl;
  const hostname = scan.hostname;

  const [virusTotal, whois, safeBrowsing, urlScan] = await Promise.all([
    virusTotalService.lookupUrl(url),
    whoisService.lookupDomain(hostname),
    safeBrowsingService.checkUrl(url),
    urlScanService.scanUrl(url),
  ]);

  return { virusTotal, whois, safeBrowsing, urlScan };
};

/**
 * Run full threat intelligence analysis on an existing scan.
 *
 * @param {string} userId - Logged-in user ID
 * @param {string} scanId - MongoDB scan document ID
 * @returns {Object} Updated scan with intelligence data
 */
const runThreatIntelligence = async (userId, scanId) => {
  const scan = await UrlScan.findOne({ _id: scanId, userId });

  if (!scan) {
    const error = new Error('Scan not found');
    error.statusCode = 404;
    throw error;
  }

  const sources = await runIntelligenceSources(scan);

  const aggregated = aggregateThreats({
    ruleScore: scan.riskScore,
    virusTotal: sources.virusTotal,
    whois: sources.whois,
    safeBrowsing: sources.safeBrowsing,
    urlScan: sources.urlScan,
  });

  scan.virusTotal = sources.virusTotal;
  scan.whois = sources.whois;
  scan.safeBrowsing = sources.safeBrowsing;
  scan.urlScan = sources.urlScan;
  scan.confidence = aggregated.confidence;
  scan.finalRiskScore = aggregated.finalRiskScore;
  scan.finalThreatLevel = aggregated.finalThreatLevel;
  scan.intelligenceRecommendation = aggregated.recommendation;
  scan.intelligenceSourcesUsed = aggregated.sourcesUsed;
  scan.intelligenceSourcesFailed = aggregated.sourcesFailed;
  scan.intelligenceGenerated = true;
  scan.intelligenceGeneratedAt = new Date();

  await scan.save();

  return {
    scan,
    aggregated,
    sourcesAvailable: aggregated.sourcesUsed.length,
    sourcesFailed: aggregated.sourcesFailed,
  };
};

module.exports = {
  runThreatIntelligence,
  runIntelligenceSources,
};
