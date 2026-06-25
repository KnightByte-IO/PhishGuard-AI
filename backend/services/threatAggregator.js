/**
 * services/threatAggregator.js
 *
 * Combines scores from ALL threat intelligence sources into one final report.
 *
 * Sources and default weights:
 *   Rule Engine     30%  — our own rule-based scanner (source of truth baseline)
 *   VirusTotal      25%  — multi-vendor reputation
 *   Safe Browsing   20%  — Google's threat lists
 *   WHOIS           15%  — domain age and registration signals
 *   URLScan         10%  — live page analysis and redirects
 *
 * If a source fails, its weight is redistributed among available sources.
 * Confidence = percentage of sources that responded successfully.
 */

/**
 * Map a 0–100 score to threat level label.
 */
const getThreatLevel = (score) => {
  if (score <= 19) return 'Safe';
  if (score <= 39) return 'Low';
  if (score <= 59) return 'Medium';
  if (score <= 79) return 'High';
  return 'Critical';
};

/**
 * Score VirusTotal results (0–100).
 * Higher malicious ratio = higher risk.
 */
const scoreVirusTotal = (vt) => {
  if (!vt?.available) return null;

  const total =
    (vt.maliciousCount || 0) +
    (vt.suspiciousCount || 0) +
    (vt.harmlessCount || 0) +
    (vt.undetectedCount || 0);

  if (total === 0) return 50;

  const threatRatio =
    ((vt.maliciousCount || 0) * 1.0 + (vt.suspiciousCount || 0) * 0.5) / total;

  return Math.min(Math.round(threatRatio * 100), 100);
};

/**
 * Score Google Safe Browsing (0 or 100).
 */
const scoreSafeBrowsing = (sb) => {
  if (!sb?.available) return null;
  if (sb.safe) return 0;

  if (sb.malware) return 100;
  if (sb.phishing) return 90;
  if (sb.unwantedSoftware) return 70;

  return 80;
};

/**
 * Score WHOIS domain age (younger = riskier).
 */
const scoreWhois = (whois) => {
  if (!whois?.available) return null;

  const age = whois.domainAgeDays;

  if (age === null || age === undefined) return 40;
  if (age < 7) return 95;
  if (age < 30) return 80;
  if (age < 90) return 60;
  if (age < 365) return 35;
  return 10;
};

/**
 * Score URLScan live analysis.
 */
const scoreUrlScan = (us) => {
  if (!us?.available) return null;

  let score = 20;

  const redirects = us.redirectChain?.length || 0;
  if (redirects > 3) score += 40;
  else if (redirects > 1) score += 20;

  const title = (us.pageTitle || '').toLowerCase();
  const suspiciousTitleWords = ['login', 'verify', 'sign in', 'password', 'account', 'bank'];
  if (suspiciousTitleWords.some((word) => title.includes(word))) {
    score += 25;
  }

  return Math.min(score, 100);
};

/**
 * Build a human-readable final recommendation.
 */
const buildRecommendation = (finalScore, level, sources) => {
  const parts = [];

  if (level === 'Critical' || level === 'High') {
    parts.push('Do not visit this URL or enter any personal information.');
    parts.push('Block this URL and report it to your security team.');
  } else if (level === 'Medium') {
    parts.push('Exercise caution — verify the sender and domain before proceeding.');
    parts.push('Do not enter credentials unless you are certain the site is legitimate.');
  } else if (level === 'Low') {
    parts.push('Minor concerns detected — double-check the URL matches the official domain.');
  } else {
    parts.push('No significant threats detected across available intelligence sources.');
    parts.push('Continue practicing safe browsing habits.');
  }

  if (sources.virusTotal?.available && sources.virusTotal.maliciousCount > 0) {
    parts.push(
      `VirusTotal: ${sources.virusTotal.maliciousCount} vendor(s) flagged this URL as malicious.`
    );
  }

  if (sources.safeBrowsing?.available && !sources.safeBrowsing.safe) {
    parts.push('Google Safe Browsing has listed this URL as a known threat.');
  }

  if (sources.whois?.available && sources.whois.domainAgeDays !== null && sources.whois.domainAgeDays < 30) {
    parts.push(`Domain is only ${sources.whois.domainAgeDays} days old — newly registered domains are common in phishing.`);
  }

  return parts;
};

/**
 * Aggregate all threat intelligence into final scores.
 *
 * @param {Object} params
 * @param {number} params.ruleScore - Rule-based risk score (0–100)
 * @param {Object} params.virusTotal - VirusTotal service result
 * @param {Object} params.whois - WHOIS service result
 * @param {Object} params.safeBrowsing - Safe Browsing service result
 * @param {Object} params.urlScan - URLScan service result
 * @returns {Object} Final risk score, confidence, threat level, recommendation
 */
const aggregateThreats = ({ ruleScore, virusTotal, whois, safeBrowsing, urlScan }) => {
  const sources = [
    { name: 'ruleEngine', weight: 30, score: ruleScore },
    { name: 'virusTotal', weight: 25, score: scoreVirusTotal(virusTotal) },
    { name: 'safeBrowsing', weight: 20, score: scoreSafeBrowsing(safeBrowsing) },
    { name: 'whois', weight: 15, score: scoreWhois(whois) },
    { name: 'urlScan', weight: 10, score: scoreUrlScan(urlScan) },
  ];

  const available = sources.filter((s) => s.score !== null && s.score !== undefined);
  const totalWeight = available.reduce((sum, s) => sum + s.weight, 0);

  let finalRiskScore = ruleScore;

  if (available.length > 0 && totalWeight > 0) {
    finalRiskScore = Math.round(
      available.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight
    );
  }

  finalRiskScore = Math.min(Math.max(finalRiskScore, 0), 100);

  const confidence = Math.round((available.length / sources.length) * 100);
  const finalThreatLevel = getThreatLevel(finalRiskScore);

  const recommendation = buildRecommendation(finalRiskScore, finalThreatLevel, {
    virusTotal,
    safeBrowsing,
    whois,
    urlScan,
  });

  return {
    finalRiskScore,
    confidence,
    finalThreatLevel,
    recommendation,
    sourcesUsed: available.map((s) => s.name),
    sourcesFailed: sources
      .filter((s) => s.score === null || s.score === undefined)
      .map((s) => s.name),
  };
};

module.exports = {
  aggregateThreats,
  getThreatLevel,
  scoreVirusTotal,
  scoreSafeBrowsing,
  scoreWhois,
  scoreUrlScan,
};
