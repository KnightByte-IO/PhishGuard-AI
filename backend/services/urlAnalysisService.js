/**
 * services/urlAnalysisService.js
 *
 * Rule-based URL Intelligence Engine (no external APIs).
 * Parses URLs, runs security checks, calculates risk score, and saves scans.
 */

const UrlScan = require('../models/UrlScan');
const {
  SUSPICIOUS_KEYWORDS,
  URL_SHORTENERS,
  SUSPICIOUS_SPECIAL_CHARS,
} = require('../utils/urlConstants');

/**
 * Risk level thresholds (score 0–100):
 *   Safe     0–19   — No significant red flags
 *   Low      20–39  — Minor concerns
 *   Medium   40–59  — Multiple warning signs
 *   High     60–79  — Strong phishing indicators
 *   Critical 80–100 — Very likely malicious
 */
const getRiskLevel = (score) => {
  if (score <= 19) return 'Safe';
  if (score <= 39) return 'Low';
  if (score <= 59) return 'Medium';
  if (score <= 79) return 'High';
  return 'Critical';
};

/**
 * Check if hostname is an IPv4 or IPv6 address.
 */
const isIPAddress = (hostname) => {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Pattern.test(hostname)) {
    const parts = hostname.split('.').map(Number);
    return parts.every((part) => part >= 0 && part <= 255);
  }

  return ipv6Pattern.test(hostname) || hostname.includes(':');
};

/**
 * Count subdomains in a hostname (beginner-friendly approach).
 * example.com → 0 | www.example.com → 1 | a.b.example.com → 2
 */
const countSubdomains = (hostname) => {
  const parts = hostname.split('.');
  if (parts.length <= 2) return 0;
  return parts.length - 2;
};

/**
 * Normalize user input into a parseable URL string.
 */
const normalizeInputUrl = (input) => {
  let trimmed = input.trim();

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed;
};

/**
 * Validate and parse URL using the built-in URL class.
 */
const parseUrl = (input) => {
  const normalizedUrl = normalizeInputUrl(input);
  const parsed = new URL(normalizedUrl);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    const error = new Error('Only HTTP and HTTPS URLs are supported');
    error.statusCode = 400;
    throw error;
  }

  if (!parsed.hostname) {
    const error = new Error('Invalid URL — hostname is missing');
    error.statusCode = 400;
    throw error;
  }

  return { parsed, normalizedUrl };
};

/**
 * Find suspicious keywords in the full URL (path + query + hostname).
 */
const findSuspiciousKeywords = (urlString) => {
  const lowerUrl = urlString.toLowerCase();
  return SUSPICIOUS_KEYWORDS.filter((keyword) => lowerUrl.includes(keyword));
};

/**
 * Detect obfuscation characters in the raw URL string.
 */
const hasSpecialCharacters = (rawUrl) => {
  return SUSPICIOUS_SPECIAL_CHARS.some((char) => rawUrl.includes(char));
};

/**
 * Detect punycode (internationalized domain names used in homograph attacks).
 */
const hasPunycode = (hostname) => {
  return hostname.toLowerCase().includes('xn--');
};

/**
 * Check if hostname belongs to a known URL shortener service.
 */
const isShortenedUrl = (hostname) => {
  const lowerHost = hostname.toLowerCase();
  return URL_SHORTENERS.some(
    (shortener) => lowerHost === shortener || lowerHost.endsWith(`.${shortener}`)
  );
};

/**
 * Risk scoring algorithm (rule-based, 0–100):
 *
 * | Check                        | Points |
 * |------------------------------|--------|
 * | Not using HTTPS              | +15    |
 * | Hostname is an IP address    | +25    |
 * | Domain length > 50 chars     | +10    |
 * | More than 2 subdomains       | +15    |
 * | Suspicious keywords found    | +15 base + 5 per keyword (max +25) |
 * | Special characters (@, %, ..)| +10    |
 * | Punycode domain (xn--)       | +25    |
 * | Known URL shortener          | +15    |
 *
 * Total is capped at 100.
 */
const calculateRiskScore = (checks) => {
  let score = 0;

  if (!checks.isHttps) score += 15;
  if (checks.hasIPAddress) score += 25;
  if (checks.domainLength > 50) score += 10;
  if (checks.subdomainCount > 2) score += 15;

  if (checks.containsSuspiciousKeywords) {
    const keywordBonus = Math.min(checks.matchedKeywords.length * 5, 25);
    score += 15 + keywordBonus;
  }

  if (checks.containsSpecialCharacters) score += 10;
  if (checks.containsPunycode) score += 25;
  if (checks.isShortenedUrl) score += 15;

  return Math.min(score, 100);
};

/**
 * Build human-readable reasons from check results.
 */
const buildReasons = (checks) => {
  const reasons = [];

  if (!checks.isHttps) {
    reasons.push('Connection does not use HTTPS encryption');
  }
  if (checks.hasIPAddress) {
    reasons.push('URL uses a raw IP address instead of a domain name');
  }
  if (checks.domainLength > 50) {
    reasons.push(`Unusually long domain name (${checks.domainLength} characters)`);
  }
  if (checks.subdomainCount > 2) {
    reasons.push(`Excessive subdomains detected (${checks.subdomainCount})`);
  }
  if (checks.containsSuspiciousKeywords) {
    reasons.push(
      `Suspicious keywords found: ${checks.matchedKeywords.join(', ')}`
    );
  }
  if (checks.containsSpecialCharacters) {
    reasons.push('URL contains special characters that may hide the real destination');
  }
  if (checks.containsPunycode) {
    reasons.push('Domain uses Punycode encoding (possible homograph attack)');
  }
  if (checks.isShortenedUrl) {
    reasons.push('URL uses a known link shortener service');
  }

  if (reasons.length === 0) {
    reasons.push('No significant phishing indicators detected');
  }

  return reasons;
};

/**
 * Build actionable suggestions based on risk level and findings.
 */
const buildSuggestions = (riskLevel, checks) => {
  const suggestions = [];

  if (riskLevel === 'Safe' || riskLevel === 'Low') {
    suggestions.push('Continue to verify the sender before entering any credentials');
    suggestions.push('Check that the domain matches the official organization');
  }

  if (!checks.isHttps) {
    suggestions.push('Avoid entering passwords on non-HTTPS websites');
  }
  if (checks.hasIPAddress) {
    suggestions.push('Do not trust links that use IP addresses — use official domains');
  }
  if (checks.containsSuspiciousKeywords) {
    suggestions.push('Be cautious — this URL contains words commonly used in phishing');
  }
  if (checks.containsPunycode) {
    suggestions.push('Visually compare each character — Punycode domains can mimic real brands');
  }
  if (checks.isShortenedUrl) {
    suggestions.push('Expand shortened URLs with a preview tool before clicking');
  }

  if (riskLevel === 'High' || riskLevel === 'Critical') {
    suggestions.push('Do not enter personal information on this site');
    suggestions.push('Report this URL to your security team or email provider');
    suggestions.push('Delete the message that contained this link');
  }

  return [...new Set(suggestions)];
};

/**
 * Run full URL analysis and persist result to database.
 */
const analyzeUrl = async (userId, urlInput) => {
  if (!urlInput || typeof urlInput !== 'string' || !urlInput.trim()) {
    const error = new Error('Please provide a valid URL to analyze');
    error.statusCode = 400;
    throw error;
  }

  const { parsed, normalizedUrl } = parseUrl(urlInput);
  const hostname = parsed.hostname.toLowerCase();
  const matchedKeywords = findSuspiciousKeywords(normalizedUrl.toLowerCase());

  const checks = {
    originalUrl: urlInput.trim(),
    normalizedUrl,
    protocol: parsed.protocol,
    hostname,
    domainLength: hostname.length,
    isHttps: parsed.protocol === 'https:',
    hasIPAddress: isIPAddress(hostname),
    subdomainCount: countSubdomains(hostname),
    containsSuspiciousKeywords: matchedKeywords.length > 0,
    containsSpecialCharacters: hasSpecialCharacters(urlInput),
    containsPunycode: hasPunycode(hostname),
    isShortenedUrl: isShortenedUrl(hostname),
    matchedKeywords,
  };

  const riskScore = calculateRiskScore(checks);
  const riskLevel = getRiskLevel(riskScore);
  const reasons = buildReasons(checks);
  const suggestions = buildSuggestions(riskLevel, checks);

  const scan = await UrlScan.create({
    userId,
    ...checks,
    riskScore,
    riskLevel,
    analysisDate: new Date(),
    reasons,
    suggestions,
  });

  return scan;
};

/**
 * Get scan history for a user (most recent first).
 */
const getScanHistory = async (userId, limit = 20) => {
  return UrlScan.find({ userId })
    .sort({ analysisDate: -1 })
    .limit(limit)
    .select('-__v');
};

/**
 * Dashboard statistics for URL scans.
 */
const getScanStats = async (userId) => {
  const [totalScans, highRiskCount, safeCount, recentScans] = await Promise.all([
    UrlScan.countDocuments({ userId }),
    UrlScan.countDocuments({
      userId,
      riskLevel: { $in: ['High', 'Critical'] },
    }),
    UrlScan.countDocuments({
      userId,
      riskLevel: 'Safe',
    }),
    UrlScan.find({ userId })
      .sort({ analysisDate: -1 })
      .limit(5)
      .select('originalUrl riskScore riskLevel analysisDate hostname'),
  ]);

  return { totalScans, highRiskCount, safeCount, recentScans };
};

module.exports = {
  analyzeUrl,
  getScanHistory,
  getScanStats,
  getRiskLevel,
  calculateRiskScore,
};
