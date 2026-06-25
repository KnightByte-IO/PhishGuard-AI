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

  if (!response.ok) {
    throw new Error(`Submit failed (${response.status})`);
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

  if (!response.ok) {
    throw new Error(`Report fetch failed (${response.status})`);
  }

  return response.json();
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

    // If URL not in VT database yet, submit it and wait briefly
    if (!report) {
      await submitUrl(url, apiKey);
      await new Promise((resolve) => setTimeout(resolve, 15000));
      report = await fetchUrlReport(url, apiKey);
    }

    if (!report) {
      return failure('VirusTotal', new Error('Report not ready yet — try again later'));
    }

    const stats = report.data?.attributes?.last_analysis_stats || {};
    const results = report.data?.attributes?.last_analysis_results || {};

    // Build list of vendors that detected a threat
    const detectedVendors = Object.entries(results)
      .filter(([, result]) => result.category === 'malicious' || result.category === 'suspicious')
      .map(([vendor, result]) => ({
        vendor,
        category: result.category,
        result: result.result,
      }));

    return success({
      maliciousCount: stats.malicious || 0,
      suspiciousCount: stats.suspicious || 0,
      harmlessCount: stats.harmless || 0,
      undetectedCount: stats.undetected || 0,
      detectedVendors,
      totalEngines: Object.keys(results).length,
    });
  } catch (error) {
    return failure('VirusTotal', error);
  }
};

module.exports = { lookupUrl };
