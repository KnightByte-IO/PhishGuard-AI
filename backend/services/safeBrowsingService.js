/**
 * services/safeBrowsingService.js
 *
 * Checks URLs against Google Safe Browsing threat lists.
 * Detects phishing, malware, and unwanted software threats.
 *
 * Requires: GOOGLE_SAFE_BROWSING_API_KEY in .env
 * Docs: https://developers.google.com/safe-browsing/v4/reference/rest
 */

const { success, failure } = require('../utils/serviceResult');

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
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed (${response.status})`);
    }

    const data = await response.json();
    const matches = data.matches || [];

    // Map Google's threat types to our friendly labels
    const phishing = matches.some(
      (m) => m.threatType === 'SOCIAL_ENGINEERING'
    );
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
