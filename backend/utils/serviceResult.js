/**
 * utils/serviceResult.js
 *
 * Helper for graceful API failures across threat intelligence services.
 * Each service returns a consistent shape: { available, error?, ...data }
 * so one failed API never crashes the entire scan.
 */

/**
 * Wrap successful service data with available: true
 */
const success = (data) => ({
  available: true,
  error: null,
  ...data,
});

/**
 * Wrap failed service call with available: false
 */
const failure = (serviceName, error) => ({
  available: false,
  error: `${serviceName}: ${error?.message || 'Service unavailable'}`,
});

module.exports = { success, failure };
