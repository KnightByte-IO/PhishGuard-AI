/**
 * services/geminiThreatService.js
 *
 * AI Threat Explanation Engine — uses Google Gemini ONLY to explain
 * rule-based scanner findings in natural language.
 *
 * IMPORTANT: Gemini does NOT decide if a URL is malicious.
 * The rule-based URL scanner is the single source of truth.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Build the prompt sent to Gemini.
 * We pass scanner results as facts — Gemini must NOT re-score or override them.
 */
const buildPrompt = (scanReport) => {
  return `You are a cybersecurity educator working for PhishGuard AI.

CRITICAL RULES:
1. You must NOT determine whether the URL is malicious. That decision is ALREADY MADE by our rule-based scanner.
2. You must NOT change, question, or recalculate the risk score (${scanReport.riskScore}) or risk level (${scanReport.riskLevel}).
3. Your ONLY job is to EXPLAIN the scanner's findings in clear, beginner-friendly language.
4. Base your explanation ONLY on the scan report data provided below.
5. Return ONLY valid JSON — no markdown, no code fences, no extra text.

SCAN REPORT (source of truth — do not override):
${JSON.stringify(scanReport, null, 2)}

Generate a threat explanation with these sections:
- summary: 2-3 sentence overview of what the scanner found
- attackType: most likely attack type based on indicators (e.g. "Phishing", "Credential Harvesting", "Brand Impersonation", "Likely Safe", "URL Obfuscation")
- reasons: array of plain-language strings explaining each red flag from the scan
- recommendations: array of specific actions the user should take right now
- securityTips: array of educational cybersecurity tips related to these findings

Return ONLY this JSON object:
{
  "summary": "",
  "attackType": "",
  "reasons": [],
  "recommendations": [],
  "securityTips": []
}`;
};

/**
 * Parse Gemini's text response into a JSON object.
 * Handles cases where the model wraps JSON in markdown code blocks.
 */
const parseGeminiJson = (text) => {
  let cleaned = text.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  // Validate required fields exist
  const required = ['summary', 'attackType', 'reasons', 'recommendations', 'securityTips'];
  for (const field of required) {
    if (parsed[field] === undefined) {
      throw new Error(`Gemini response missing required field: ${field}`);
    }
  }

  return {
    summary: String(parsed.summary),
    attackType: String(parsed.attackType),
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map(String)
      : [],
    securityTips: Array.isArray(parsed.securityTips)
      ? parsed.securityTips.map(String)
      : [],
  };
};

/**
 * Convert a UrlScan document into the input format for Gemini.
 */
const buildScanReport = (scan) => ({
  url: scan.originalUrl,
  riskScore: scan.riskScore,
  riskLevel: scan.riskLevel,
  https: scan.isHttps,
  keywords: scan.matchedKeywords || [],
  subdomains: scan.subdomainCount,
  containsIPAddress: scan.hasIPAddress,
  containsPunycode: scan.containsPunycode,
  containsSpecialCharacters: scan.containsSpecialCharacters,
  isShortenedUrl: scan.isShortenedUrl,
  domainLength: scan.domainLength,
  hostname: scan.hostname,
  scannerReasons: scan.reasons || [],
});

/**
 * Call Gemini API and return structured threat explanation.
 *
 * @param {Object} scan - Mongoose UrlScan document
 * @returns {Promise<Object>} Parsed explanation JSON
 */
const generateThreatExplanation = async (scan) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured on the server');
    error.code = 'GEMINI_CONFIG';
    throw error;
  }

  const scanReport = buildScanReport(scan);
  const prompt = buildPrompt(scanReport);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  if (!responseText) {
    throw new Error('Gemini returned an empty response');
  }

  return parseGeminiJson(responseText);
};

module.exports = {
  generateThreatExplanation,
  buildScanReport,
  buildPrompt,
};
