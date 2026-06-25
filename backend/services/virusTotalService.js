/**
 * services/virusTotalService.js
 *
 * Queries VirusTotal API v3 for URL reputation.
 * Returns how many security vendors flagged the URL as malicious/suspicious.
 *
 * Requires: VIRUSTOTAL_API_KEY in .env
 * Docs: https://developers.virustotal.com/reference/url
 */

const { success, failure } = require('../utils/serviceResult');

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 12; // up to ~60 seconds

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Convert a URL to VirusTotal's URL identifier (base64url without padding).
 */
const urlToVtId = (url) => {
  return Buffer.from(url)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Parse VirusTotal stats from a URL report or completed analysis object.
 */
const parseVtStats = (data) => {
  const attrs = data?.data?.attributes || {};
  const stats = attrs.last_analysis_stats || attrs.stats || {};
  const results = attrs.last_analysis_results || attrs.results || {};

  const detectedVendors = Object.entries(results)
    .filter(([, result]) => result.category === 'malicious' || result.category === 'suspicious')
    .map(([vendor, result]) => ({
      vendor,
      category: result.category,
      result: result.result,
    }));

  return {
    maliciousCount: stats.malicious || 0,
    suspiciousCount: stats.suspicious || 0,
    harmlessCount: stats.harmless || 0,
    undetectedCount: stats.undetected || 0,
    detectedVendors,
    totalEngines: Object.keys(results).length,
  };
};

/**
 * Submit a URL to VirusTotal for scanning.
 */
const submitUrl = async (url, apiKey) => {
  const response = await fetch('https://www.virustotal.com/api/v3/urls', {
    method: 'POST',
    headers: {
      'x-apikey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ url }),
  });

  if (response.status === 429) {
    throw new Error('Rate limit exceeded — free tier allows 4 requests/minute');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Submit failed (${response.status})${body ? `: ${body.slice(0, 120)}` : ''}`);
  }

  return response.json();
};

/**
 * Fetch URL analysis report from VirusTotal.
 */
const fetchUrlReport = async (url, apiKey) => {
  const urlId = urlToVtId(url);
  const response = await fetch(
    `https://www.virustotal.com/api/v3/urls/${urlId}`,
    { headers: { 'x-apikey': apiKey } }
  );

  if (response.status === 404) {
    return null;
  }

  if (response.status === 429) {
    throw new Error('Rate limit exceeded — free tier allows 4 requests/minute');
  }

  if (!response.ok) {
    throw new Error(`Report fetch failed (${response.status})`);
  }

  return response.json();
};

/**
 * Poll a VirusTotal analysis until it completes or times out.
 */
const pollAnalysis = async (analysisId, apiKey) => {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: { 'x-apikey': apiKey } }
    );

    if (response.status === 429) {
      throw new Error('Rate limit exceeded — free tier allows 4 requests/minute');
    }

    if (!response.ok) {
      throw new Error(`Analysis poll failed (${response.status})`);
    }

    const analysis = await response.json();
    const status = analysis.data?.attributes?.status;

    if (status === 'completed') {
      return analysis;
    }

    if (attempt < POLL_MAX_ATTEMPTS - 1) {
      await sleep(POLL_INTERVAL_MS);
    }
  }

  return null;
};

/**
 * Look up URL reputation on VirusTotal.
 *
 * @param {string} url - URL to check
 * @returns {Object} Malicious/suspicious counts and vendor list
 */
const lookupUrl = async (url) => {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    return failure('VirusTotal', new Error('API key not configured'));
  }

  try {
    let report = await fetchUrlReport(url, apiKey);

    if (!report) {
      const submitResponse = await submitUrl(url, apiKey);
      const analysisId = submitResponse.data?.id;

      if (!analysisId) {
        return failure('VirusTotal', new Error('Submit succeeded but no analysis ID returned'));
      }

      const completedAnalysis = await pollAnalysis(analysisId, apiKey);

      if (!completedAnalysis) {
        return failure(
          'VirusTotal',
          new Error('Analysis still in progress — wait a minute and run intelligence again')
        );
      }

      report = await fetchUrlReport(url, apiKey);

      if (!report) {
        return success(parseVtStats(completedAnalysis));
      }
    }

    return success(parseVtStats(report));
  } catch (error) {
    return failure('VirusTotal', error);
  }
};

module.exports = { lookupUrl };
