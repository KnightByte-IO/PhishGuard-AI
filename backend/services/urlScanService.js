/**
 * services/urlScanService.js
 *
 * Submits URLs to URLScan.io for live page analysis.
 * Returns final URL, page title, IP, hosting provider, and redirect chain.
 *
 * Requires: URLSCAN_API_KEY in .env
 * Docs: https://urlscan.io/docs/api/
 */

const { success, failure } = require('../utils/serviceResult');

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 10;

/**
 * Submit a URL to URLScan.io for scanning.
 */
const submitScan = async (url, apiKey) => {
  const response = await fetch('https://urlscan.io/api/v1/scan/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': apiKey,
    },
    body: JSON.stringify({
      url,
      visibility: 'public',
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Scan submit failed (${response.status}): ${errBody}`);
  }

  return response.json();
};

/**
 * Poll URLScan.io for scan results until complete or timeout.
 */
const pollResult = async (uuid, apiKey) => {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const response = await fetch(`https://urlscan.io/api/v1/result/${uuid}/`, {
      headers: { 'API-Key': apiKey },
    });

    if (response.status === 404) {
      continue;
    }

    if (!response.ok) {
      throw new Error(`Result fetch failed (${response.status})`);
    }

    return response.json();
  }

  throw new Error('Scan timed out — results not ready');
};

/**
 * Analyze a URL with URLScan.io.
 *
 * @param {string} url - URL to scan
 * @returns {Object} Page info, IP, hosting, redirects
 */
const scanUrl = async (url) => {
  const apiKey = process.env.URLSCAN_API_KEY;

  if (!apiKey) {
    return failure('URLScan', new Error('API key not configured'));
  }

  try {
    const submission = await submitScan(url, apiKey);
    const uuid = submission.uuid;

    if (!uuid) {
      throw new Error('No scan UUID returned');
    }

    const result = await pollResult(uuid, apiKey);

    const page = result.page || {};
    const task = result.task || {};
    const meta = result.meta || {};

    // Build redirect chain from task reports and page data
    const redirectChain = [];
    if (task.url && task.url !== page.url) {
      redirectChain.push(task.url);
    }
    if (page.url) {
      redirectChain.push(page.url);
    }

    // IP and hosting from first A record or processors
    const ipAddress =
      result.lists?.ips?.[0] ||
      meta.processors?.['geoip:asn']?.data?.[0]?.ip ||
      null;

    const hostingProvider =
      meta.processors?.['geoip:asn']?.data?.[0]?.name ||
      result.lists?.asns?.[0]?.name ||
      'Unknown';

    return success({
      scanId: uuid,
      finalUrl: page.url || url,
      pageTitle: page.title || 'No title',
      ipAddress,
      hostingProvider,
      redirectChain: [...new Set(redirectChain)],
      domain: page.domain || null,
    });
  } catch (error) {
    return failure('URLScan', error);
  }
};

module.exports = { scanUrl };
