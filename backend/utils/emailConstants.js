/**
 * utils/emailConstants.js
 *
 * Shared keyword lists and scoring hints for email phishing detection.
 * Keeping them in one file makes the analyzer easy to tune later.
 */

const EMAIL_SUSPICIOUS_KEYWORDS = [
  'verify',
  'urgent',
  'suspended',
  'click here',
  'password',
  'login',
  'bank',
  'payment',
  'invoice',
  'security alert',
  'confirm',
  'reset password',
];

const EMAIL_URGENT_PHRASES = [
  'act now',
  'immediately',
  'within 24 hours',
  'your account will be closed',
  'urgent action required',
  'limited time',
];

module.exports = {
  EMAIL_SUSPICIOUS_KEYWORDS,
  EMAIL_URGENT_PHRASES,
};
