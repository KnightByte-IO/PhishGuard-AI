/**
 * services/urlScanService.js
 *
 * Submits URLs to URLScan.io for live page analysis.
 * Falls back to Search API when new scans are blocked (common for major domains).
 *
 * Requires: URLSCAN_API_KEY in .env
 * Docs: https://urlscan.io/docs/api/
 */

const { success, failure } = require('../utils/serviceResult');

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 15;

const apiHeaders = (apiKey) => ({
  'Content-Type': 'application/json',
  'API-Key': apiKey,
});

/**
 * Normalize URL for URLScan submission.
 */
const normalizeUrl = (url) => {
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return new URL(trimmed).toString();
};

/**
 * Check if hostname cannot be scanned live (localhost, private IPs).
 */
const isNonScannableHost = (hostname) => {
  const host = hostname.toLowerCase();

  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    return true;
  }

  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return false;

  const octets = match.slice(1).map(Number);
  if (octets.some((n) => n < 0 || n > 255)) return false;

  const [a, b] = octets;
  if (a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
};

/**
 * Parse URLScan error body into a short message.
 */
const parseSubmitError = (status, bodyText) => {
  try {
    const data = JSON.parse(bodyText);
    const detail = data.description || data.message || data.errors?.[0]?.detail;
    if (detail) return detail;
  } catch {
    // ignore JSON parse errors
  }
  return `Scan submit failed (${status})`;
};

/**
 * Build a consistent response from a URLScan result payload.
 */
const buildScanData = (result, fallbackUrl, uuid, source = 'live') => {
  const page = result.page || {};
  const task = result.task || {};
  const meta = result.meta || {};

  const redirectChain = [];
  if (task.url && task.url !== page.url) {
    redirectChain.push(task.url);
  }
  if (page.url) {
    redirectChain.push(page.url);
  }

  const ipAddress =
    result.lists?.ips?.[0] ||
    meta.processors?.['geoip:asn']?.data?.[0]?.ip ||
    null;

  const hostingProvider =
    meta.processors?.['geoip:asn']?.data?.[0]?.name ||
    result.lists?.asns?.[0]?.name ||
    'Unknown';

  return {
    scanId: uuid,
    finalUrl: page.url || fallbackUrl,
    pageTitle: page.title || 'No title',
    ipAddress,
    hostingProvider,
    redirectChain: [...new Set(redirectChain)],
    domain: page.domain || null,
    dataSource: source,
  };
};

/**
 * Submit a URL to URLScan.io for scanning.
 */
const submitScan = async (url, apiKey) => {
  const response = await fetch('https://urlscan.io/api/v1/scan/', {
    method: 'POST',
    headers: apiHeaders(apiKey),
    body: JSON.stringify({
      url,
      visibility: 'unlisted',
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    const error = new Error(parseSubmitError(response.status, errBody));
    error.status = response.status;
    error.blocked =
      errBody.includes('blocked from scanning') ||
      errBody.includes('blacklist') ||
      errBody.includes('Blacklisted');
    throw error;
  }

  return response.json();
};

/**
 * Search URLScan.io for existing public scans of this URL or domain.
 */
const searchExistingScan = async (url, apiKey) => {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const queries = [
    `page.url:"${url}"`,
    `task.url:"${url}"`,
    `domain:${hostname}`,
    `page.domain:${hostname}`,
  ];

  for (const query of queries) {
    const response = await fetch(
      `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(query)}&size=1`,
      { headers: { 'API-Key': apiKey } }
    );

    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const hit = data.results?.[0];

    if (hit?._id) {
      return {
        uuid: hit._id,
        partial: hit,
      };
    }
  }

  return null;
};

/**
 * Fetch full scan result by UUID.
 */
const fetchResult = async (uuid, apiKey) => {
  const response = await fetch(`https://urlscan.io/api/v1/result/${uuid}/`, {
    headers: { 'API-Key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Result fetch failed (${response.status})`);
  }

  return response.json();
};

/**
 * Poll URLScan.io for scan results until complete or timeout.
 */
const pollResult = async (uuid, apiKey) => {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
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
 * Try to load data from a historical search hit (search payload or full result).
 */
const loadFromSearchHit = async (hit, url, apiKey) => {
  try {
    const full = await fetchResult(hit.uuid, apiKey);
    return buildScanData(full, url, hit.uuid, 'historical');
  } catch {
    if (hit.partial?.page || hit.partial?.task) {
      return buildScanData(hit.partial, url, hit.uuid, 'historical');
    }
    throw new Error('Historical scan found but result could not be loaded');
  }
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
    const normalizedUrl = normalizeUrl(url);
    const hostname = new URL(normalizedUrl).hostname;

    if (isNonScannableHost(hostname)) {
      const hit = await searchExistingScan(normalizedUrl, apiKey);
      if (hit) {
        return success(await loadFromSearchHit(hit, normalizedUrl, apiKey));
      }
      return failure(
        'URLScan',
        new Error('Local/private URLs cannot be scanned live — try a public URL')
      );
    }

    try {
      const submission = await submitScan(normalizedUrl, apiKey);
      const uuid = submission.uuid;

      if (!uuid) {
        throw new Error('No scan UUID returned');
      }

      const result = await pollResult(uuid, apiKey);
      return success(buildScanData(result, normalizedUrl, uuid, 'live'));
    } catch (submitError) {
      const shouldSearch =
        submitError.blocked ||
        submitError.status === 400 ||
        submitError.status === 429;

      if (!shouldSearch) {
        throw submitError;
      }

      const hit = await searchExistingScan(normalizedUrl, apiKey);
      if (hit) {
        return success(await loadFromSearchHit(hit, normalizedUrl, apiKey));
      }

      if (submitError.blocked) {
        throw new Error(
          'URL is blocked from new scans and no historical scan was found — try a different URL'
        );
      }

      throw submitError;
    }
  } catch (error) {
    return failure('URLScan', error);
  }
};

module.exports = { scanUrl };
