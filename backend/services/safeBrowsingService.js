/**
 * services/safeBrowsingService.js
 *
 * Checks URLs against Google Safe Browsing threat lists.
 * Detects phishing, malware, and unwanted software threats.
 *
 * Requires: GOOGLE_SAFE_BROWSING_API_KEY in .env
 * Enable "Safe Browsing API" in Google Cloud Console for the key's project.
 * Docs: https://developers.google.com/safe-browsing/v4/reference/rest
 */

const { success, failure } = require('../utils/serviceResult');

/**
 * Extract a helpful message from a Google API error response.
 */
const parseGoogleError = async (response) => {
  try {
    const data = await response.json();
    const message = data.error?.message;

    if (message?.includes('Safe Browsing API has not been used') || message?.includes('SERVICE_DISABLED')) {
      return 'Enable "Safe Browsing API" in Google Cloud Console for this API key\'s project';
    }

    if (message?.includes('API key not valid')) {
      return 'Invalid API key — create a new key in Google Cloud Console';
    }

    if (message?.includes('referer') || message?.includes('Referer')) {
      return 'API key has HTTP referrer restrictions — use a server key with no referrer limit';
    }

    return message || `API request failed (${response.status})`;
  } catch {
    return `API request failed (${response.status})`;
  }
};

/**
 * Query Google Safe Browsing API v4 for threat matches.
 *
 * @param {string} url - URL to check
 * @returns {Object} Safe status and threat type flags
 */
const checkUrl = async (url) => {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    return failure('Safe Browsing', new Error('API key not configured'));
  }

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PhishGuard-AI/1.0',
        },
        body: JSON.stringify({
          client: {
            clientId: 'phishguard-ai',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      const message = await parseGoogleError(response);
      throw new Error(message);
    }

    const data = await response.json();
    const matches = data.matches || [];

    const phishing = matches.some((m) => m.threatType === 'SOCIAL_ENGINEERING');
    const malware = matches.some((m) => m.threatType === 'MALWARE');
    const unwantedSoftware = matches.some(
      (m) => m.threatType === 'UNWANTED_SOFTWARE' || m.threatType === 'POTENTIALLY_HARMFUL_APPLICATION'
    );

    const safe = matches.length === 0;

    return success({
      safe,
      phishing,
      malware,
      unwantedSoftware,
      threatTypes: matches.map((m) => m.threatType),
    });
  } catch (error) {
    return failure('Safe Browsing', error);
  }
};

module.exports = { checkUrl };
