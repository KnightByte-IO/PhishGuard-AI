/**
 * utils/smsConstants.js
 *
 * Shared keyword lists for SMS / smishing detection.
 */

const SMS_SUSPICIOUS_KEYWORDS = [
  'otp',
  'verify',
  'bank',
  'payment',
  'wallet',
  'account',
  'login',
  'suspended',
  'claim',
  'refund',
  'delivery',
  'prize',
];

const SMS_URGENT_PHRASES = [
  'act now',
  'urgent',
  'immediately',
  'within 24 hours',
  'final warning',
  'avoid suspension',
];

module.exports = {
  SMS_SUSPICIOUS_KEYWORDS,
  SMS_URGENT_PHRASES,
};
