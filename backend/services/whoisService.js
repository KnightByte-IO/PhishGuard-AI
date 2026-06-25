/**
 * services/whoisService.js
 *
 * Looks up domain registration info using the free RDAP protocol.
 * RDAP is the modern replacement for WHOIS and returns structured JSON.
 *
 * No API key required — uses https://rdap.org
 */

const { success, failure } = require('../utils/serviceResult');

/**
 * Extract the registrable domain from a hostname (beginner-friendly).
 * e.g. www.shop.example.com → example.com
 */
const getBaseDomain = (hostname) => {
  const parts = hostname.toLowerCase().split('.');

  if (parts.length <= 2) {
    return hostname.toLowerCase();
  }

  // Handle common two-part TLDs like co.uk
  const twoPartTlds = ['co.uk', 'com.au', 'co.in', 'org.uk', 'net.au'];
  const lastTwo = parts.slice(-2).join('.');

  if (twoPartTlds.includes(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
};

/**
 * Calculate domain age in days from registration date.
 */
const calculateDomainAgeDays = (registrationDate) => {
  if (!registrationDate) return null;

  const registered = new Date(registrationDate);
  const now = new Date();
  const diffMs = now - registered;

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Parse RDAP JSON response into our WHOIS format.
 */
const parseRdapResponse = (data) => {
  const events = data.events || [];

  const registrationEvent = events.find((e) => e.eventAction === 'registration');
  const expirationEvent = events.find((e) => e.eventAction === 'expiration');

  const registrationDate = registrationEvent?.eventDate || null;
  const expirationDate = expirationEvent?.eventDate || null;

  // Find registrar entity
  const registrarEntity = (data.entities || []).find((entity) =>
    entity.roles?.includes('registrar')
  );

  let registrar = 'Unknown';
  if (registrarEntity?.vcardArray) {
    const fnField = registrarEntity.vcardArray[1]?.find((f) => f[0] === 'fn');
    registrar = fnField ? fnField[3] : registrar;
  }

  // Country from registrar or registrant entity
  let country = 'Unknown';
  const countryEntity = (data.entities || []).find((entity) =>
    entity.roles?.includes('registrant') || entity.roles?.includes('registrar')
  );

  if (countryEntity?.vcardArray) {
    const countryField = countryEntity.vcardArray[1]?.find((f) => f[0] === 'adr');
    if (countryField && countryField[3]?.country) {
      country = countryField[3].country;
    }
  }

  // Fallback: country from RDAP top-level field
  if (country === 'Unknown' && data.country) {
    country = data.country;
  }

  const domainAgeDays = calculateDomainAgeDays(registrationDate);

  return {
    registrar,
    registrationDate,
    expirationDate,
    country,
    domainAgeDays,
  };
};

/**
 * Perform WHOIS/RDAP lookup for a domain.
 *
 * @param {string} hostname - Domain from parsed URL
 * @returns {Object} Registrar, dates, country, domain age
 */
const lookupDomain = async (hostname) => {
  try {
    // IP addresses don't have WHOIS domain records
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
      return failure('WHOIS', new Error('WHOIS lookup not applicable for IP addresses'));
    }

    const domain = getBaseDomain(hostname);
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { Accept: 'application/rdap+json' },
    });

    if (!response.ok) {
      throw new Error(`RDAP lookup failed (${response.status})`);
    }

    const data = await response.json();
    const parsed = parseRdapResponse(data);

    return success(parsed);
  } catch (error) {
    return failure('WHOIS', error);
  }
};

module.exports = { lookupDomain, getBaseDomain, calculateDomainAgeDays };
