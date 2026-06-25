/**
 * utils/urlConstants.js
 *
 * Shared constants for URL threat analysis.
 * Centralized lists make it easy to add new keywords or shorteners later.
 */

// Words commonly used in phishing pages to steal credentials
const SUSPICIOUS_KEYWORDS = [
  'login',
  'verify',
  'secure',
  'update',
  'bank',
  'password',
  'signin',
  'confirm',
  'account',
  'wallet',
  'payment',
];

// Known URL shortening services — often used to hide malicious destinations
const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'short.link',
  'rb.gy',
  'tiny.cc',
  'bl.ink',
  'soo.gd',
  's.id',
];

// Characters that may indicate obfuscation or credential phishing in URLs
const SUSPICIOUS_SPECIAL_CHARS = ['@', '%', '\\', '..'];

module.exports = {
  SUSPICIOUS_KEYWORDS,
  URL_SHORTENERS,
  SUSPICIOUS_SPECIAL_CHARS,
};
