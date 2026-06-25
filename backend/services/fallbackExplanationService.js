/**
 * services/fallbackExplanationService.js
 *
 * Generates detailed, URL-specific threat explanations from scan data
 * when Gemini is unavailable or misconfigured.
 */

const KNOWN_TRUSTED_DOMAINS = [
  'google.com',
  'youtube.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'github.com',
  'mongodb.com',
  'cloud.mongodb.com',
  'facebook.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
];

const isTrustedDomain = (hostname) => {
  const host = (hostname || '').toLowerCase();
  return KNOWN_TRUSTED_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
};

const inferAttackType = (scan) => {
  const { riskLevel, containsPunycode, isShortenedUrl, hasIPAddress, matchedKeywords } = scan;

  if (riskLevel === 'Safe') {
    if (isTrustedDomain(scan.hostname)) return 'Legitimate Service';
    return 'Low Risk — No Major Threats';
  }

  if (riskLevel === 'Low') return 'Low Risk — Minor Concerns';

  if (containsPunycode) return 'Brand Impersonation (Homograph)';
  if (hasIPAddress) return 'Suspicious Hosting (IP-based URL)';
  if (isShortenedUrl) return 'URL Obfuscation (Shortener)';
  if (matchedKeywords?.length) return 'Credential Harvesting Risk';
  if (riskLevel === 'Critical') return 'High-Confidence Phishing';
  if (riskLevel === 'High') return 'Probable Phishing';

  return 'Suspicious URL';
};

const explainCheck = (scan) => {
  const lines = [];

  lines.push(
    scan.isHttps
      ? `HTTPS is enabled on ${scan.hostname}, so traffic between your browser and the server is encrypted.`
      : `This URL uses HTTP (not HTTPS) on ${scan.hostname}. Without encryption, login details or personal data could be intercepted on untrusted networks.`
  );

  if (scan.hasIPAddress) {
    lines.push(
      `The link points to a raw IP address (${scan.hostname}) instead of a normal domain name. Trusted companies almost always use branded domains — IP-only links are a common phishing technique.`
    );
  } else {
    lines.push(
      `The hostname is ${scan.hostname} (${scan.domainLength} characters). ${
        scan.domainLength > 50
          ? 'That is unusually long and can be used to hide a fake brand inside a complex domain.'
          : 'The length is within a normal range for legitimate websites.'
      }`
    );
  }

  if (scan.subdomainCount > 2) {
    lines.push(
      `The URL has ${scan.subdomainCount} subdomains (e.g. layers before the main domain). Attackers often stack subdomains like secure.login.bank.com.evil.net to mimic trusted brands.`
    );
  } else if (scan.subdomainCount > 0) {
    lines.push(
      `The URL uses ${scan.subdomainCount} subdomain level(s), which is common for legitimate services (e.g. cloud.mongodb.com, mail.google.com).`
    );
  }

  if (scan.matchedKeywords?.length) {
    lines.push(
      `Suspicious words were found in the URL path or query: "${scan.matchedKeywords.join('", "')}". Phishing pages often include terms like login, verify, or password to pressure users into entering credentials.`
    );
  }

  if (scan.containsSpecialCharacters) {
    lines.push(
      `The submitted link contains special characters (such as @, %, or encoded symbols). These can sometimes disguise the real destination in the address bar, so the scanner flagged this as a precaution — verify the final domain is ${scan.hostname} before you trust the link.`
    );
  }

  if (scan.containsPunycode) {
    lines.push(
      `The domain uses Punycode (internationalized characters). Criminals abuse this to create look-alike domains that appear identical to real brands (e.g. replacing "o" with a Cyrillic character).`
    );
  }

  if (scan.isShortenedUrl) {
    lines.push(
      `This URL uses a known link shortener. Shorteners hide the true destination until you click, which is why both marketers and attackers use them — expand the link first if you did not expect it.`
    );
  }

  return lines;
};

const explainIntelligence = (scan) => {
  const lines = [];

  if (scan.virusTotal?.available) {
    const vt = scan.virusTotal;
    if (vt.maliciousCount > 0 || vt.suspiciousCount > 0) {
      lines.push(
        `VirusTotal reports ${vt.maliciousCount} vendor(s) flagged this URL as malicious and ${vt.suspiciousCount} as suspicious across ${vt.totalEngines || 'multiple'} scanning engines.`
      );
    } else {
      lines.push(
        `VirusTotal checked this URL against ${vt.totalEngines || 'many'} security vendors and found no malicious detections.`
      );
    }
  }

  if (scan.safeBrowsing?.available) {
    if (scan.safeBrowsing.safe) {
      lines.push('Google Safe Browsing does not list this URL on any known malware or phishing blocklist.');
    } else {
      const threats = [];
      if (scan.safeBrowsing.phishing) threats.push('phishing');
      if (scan.safeBrowsing.malware) threats.push('malware');
      if (scan.safeBrowsing.unwantedSoftware) threats.push('unwanted software');
      lines.push(
        `Google Safe Browsing flagged this URL for: ${threats.join(', ') || 'known threats'}. Treat it as dangerous.`
      );
    }
  }

  if (scan.whois?.available && scan.whois.domainAgeDays != null) {
    const age = scan.whois.domainAgeDays;
    lines.push(
      age < 30
        ? `WHOIS data shows the domain is only ${age} days old. Brand-new domains are frequently used for phishing before they get reported and blocked.`
        : `WHOIS data shows the domain has been registered for about ${age} days, which ${age > 365 ? 'suggests an established presence' : 'is worth noting but not automatically dangerous'}.`
    );
    if (scan.whois.registrar && scan.whois.registrar !== 'Unknown') {
      lines.push(`The domain is registered through ${scan.whois.registrar}.`);
    }
  }

  if (scan.urlScan?.available) {
    const us = scan.urlScan;
    lines.push(
      `URLScan.io analyzed the live page${us.pageTitle ? ` titled "${us.pageTitle}"` : ''} and resolved it to ${us.finalUrl || scan.normalizedUrl}.`
    );
    if (us.redirectChain?.length > 1) {
      lines.push(
        `The page redirected ${us.redirectChain.length - 1} time(s) before reaching the final URL — unexpected redirects can be a sign of a phishing funnel.`
      );
    }
    if (us.hostingProvider && us.hostingProvider !== 'Unknown') {
      lines.push(`Hosting appears to be provided by ${us.hostingProvider}.`);
    }
  }

  return lines;
};

const buildSummary = (scan) => {
  const url = scan.originalUrl || scan.normalizedUrl;
  const parts = [];

  parts.push(
    `PhishGuard analyzed "${url}" and assigned a ${scan.riskLevel} risk rating with a score of ${scan.riskScore} out of 100.`
  );

  if (scan.riskLevel === 'Safe' || scan.riskLevel === 'Low') {
    if (isTrustedDomain(scan.hostname)) {
      parts.push(
        `${scan.hostname} is a well-known domain associated with a major legitimate service, which supports a low-risk assessment.`
      );
    } else {
      parts.push(
        `The rule-based engine did not find strong combinations of phishing indicators on ${scan.hostname}.`
      );
    }
  } else {
    parts.push(
      `Several technical warning signs on ${scan.hostname} match patterns commonly seen in phishing, scam, or credential-theft pages.`
    );
  }

  if (scan.intelligenceGenerated && scan.finalRiskScore != null) {
    parts.push(
      `After combining external threat intelligence (VirusTotal, Safe Browsing, WHOIS, URLScan), the aggregated confidence is ${scan.confidence ?? 'N/A'}% with a final score of ${scan.finalRiskScore}/100 (${scan.finalThreatLevel || scan.riskLevel}).`
    );
  }

  parts.push(
    scan.riskLevel === 'Safe' || scan.riskLevel === 'Low'
      ? 'Even low-risk results should be confirmed by checking that you expected this link and that the sender is genuine.'
      : 'Avoid entering passwords, payment details, or one-time codes until you have verified this link through an official channel.'
  );

  return parts.join(' ');
};

const buildDetailedReasons = (scan) => {
  const reasons = [...explainCheck(scan)];

  const intelLines = explainIntelligence(scan);
  reasons.push(...intelLines);

  if (scan.reasons?.length) {
    const scannerOnly = scan.reasons.filter(
      (r) => r !== 'No significant phishing indicators detected'
    );
    if (scannerOnly.length && reasons.length <= 2) {
      scannerOnly.forEach((raw) => {
        reasons.push(`Scanner note: ${raw}`);
      });
    }
  }

  if (reasons.length === 0) {
    reasons.push(
      `No significant phishing indicators were detected on ${scan.hostname}. The URL structure, protocol, and domain characteristics appear normal based on automated checks.`
    );
  }

  return reasons;
};

const buildRecommendations = (scan) => {
  const recs = [];

  if (scan.riskLevel === 'Safe' || scan.riskLevel === 'Low') {
    recs.push(`Confirm that you intended to visit ${scan.hostname} and that the message or sender matches who you expect.`);
    recs.push('Compare the domain character-by-character with the official website if the link arrived by email or SMS.');
    if (scan.containsSpecialCharacters) {
      recs.push('Because this URL contains special characters, hover over the link (or long-press on mobile) to preview the true destination before opening it.');
    }
    if (!scan.isHttps) {
      recs.push('Do not submit passwords or payment information until the site uses HTTPS with a valid certificate.');
    }
  } else {
    recs.push('Do not click the link again and do not enter any personal or financial information on the page.');
    recs.push(`Report the URL to your IT/security team or email provider, referencing ${scan.hostname}.`);
    recs.push('If you already entered credentials, change your password immediately from a device you trust and enable two-factor authentication.');
    if (scan.safeBrowsing?.available && !scan.safeBrowsing.safe) {
      recs.push('Google Safe Browsing has flagged this URL — close the tab and run an antivirus scan if you downloaded anything.');
    }
    if (scan.virusTotal?.available && scan.virusTotal.maliciousCount > 0) {
      recs.push('Multiple antivirus engines flagged this URL — treat it as confirmed malicious.');
    }
  }

  if (scan.suggestions?.length) {
    scan.suggestions.forEach((s) => {
      if (!recs.includes(s)) recs.push(s);
    });
  }

  return recs.slice(0, 6);
};

const buildSecurityTips = (scan) => {
  const tips = [
    `Always verify unexpected links to ${scan.hostname} by visiting the organization's official app or typing the address manually.`,
    'Enable multi-factor authentication on accounts that could be targeted if this link were malicious.',
  ];

  if (scan.isShortenedUrl) {
    tips.push('Use a URL expander service to reveal the full destination before clicking shortened links.');
  }
  if (scan.containsPunycode) {
    tips.push('Watch for homograph attacks: visually compare each character in the domain against the real brand site.');
  }
  if (scan.subdomainCount > 2) {
    tips.push('Be skeptical of long subdomain chains — real banks and tech companies rarely use more than one or two subdomains in login links.');
  }
  if (scan.riskLevel === 'High' || scan.riskLevel === 'Critical') {
    tips.push('Phishers create urgency ("account locked", "payment failed") — slow down and verify through official support channels.');
  } else {
    tips.push('Hover over links in emails to preview the URL in the bottom-left corner of your browser before clicking.');
  }

  return [...new Set(tips)].slice(0, 4);
};

/**
 * Build a full explanation object from an existing UrlScan document.
 */
const generateFallbackExplanation = (scan) => ({
  summary: buildSummary(scan),
  attackType: inferAttackType(scan),
  reasons: buildDetailedReasons(scan),
  recommendations: buildRecommendations(scan),
  securityTips: buildSecurityTips(scan),
});

module.exports = { generateFallbackExplanation };
