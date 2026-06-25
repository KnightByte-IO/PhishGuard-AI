/**
 * components/url/SecurityCheckList.jsx
 *
 * Displays all security checks as pass/fail cards with icons.
 */

const CHECK_LABELS = {
  isHttps: 'HTTPS Encryption',
  hasIPAddress: 'IP Address (not domain)',
  domainLength: 'Domain Length',
  subdomainCount: 'Subdomain Count',
  containsSuspiciousKeywords: 'Suspicious Keywords',
  containsSpecialCharacters: 'Special Characters',
  containsPunycode: 'Punycode Encoding',
  isShortenedUrl: 'URL Shortener',
};

function SecurityCheckList({ scan }) {
  if (!scan) return null;

  const checks = [
    {
      key: 'isHttps',
      label: CHECK_LABELS.isHttps,
      passed: scan.isHttps,
      detail: scan.isHttps ? 'Secure connection' : 'Uses HTTP — not encrypted',
      invert: true,
    },
    {
      key: 'hasIPAddress',
      label: CHECK_LABELS.hasIPAddress,
      passed: !scan.hasIPAddress,
      detail: scan.hasIPAddress
        ? `IP detected: ${scan.hostname}`
        : 'Uses a domain name',
    },
    {
      key: 'domainLength',
      label: CHECK_LABELS.domainLength,
      passed: scan.domainLength <= 50,
      detail: `${scan.domainLength} characters`,
    },
    {
      key: 'subdomainCount',
      label: CHECK_LABELS.subdomainCount,
      passed: scan.subdomainCount <= 2,
      detail: `${scan.subdomainCount} subdomain(s)`,
    },
    {
      key: 'containsSuspiciousKeywords',
      label: CHECK_LABELS.containsSuspiciousKeywords,
      passed: !scan.containsSuspiciousKeywords,
      detail: scan.matchedKeywords?.length
        ? `Found: ${scan.matchedKeywords.join(', ')}`
        : 'No suspicious keywords',
    },
    {
      key: 'containsSpecialCharacters',
      label: CHECK_LABELS.containsSpecialCharacters,
      passed: !scan.containsSpecialCharacters,
      detail: scan.containsSpecialCharacters
        ? 'Contains @, %, or .. characters'
        : 'No obfuscation characters',
    },
    {
      key: 'containsPunycode',
      label: CHECK_LABELS.containsPunycode,
      passed: !scan.containsPunycode,
      detail: scan.containsPunycode ? 'xn-- encoding detected' : 'Standard domain encoding',
    },
    {
      key: 'isShortenedUrl',
      label: CHECK_LABELS.isShortenedUrl,
      passed: !scan.isShortenedUrl,
      detail: scan.isShortenedUrl ? 'Known shortener service' : 'Direct link',
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">Security Checks</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checks.map((check) => (
          <div
            key={check.key}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              check.passed
                ? 'bg-cyber-success/5 border-cyber-success/20'
                : 'bg-cyber-danger/5 border-cyber-danger/20'
            }`}
          >
            <span className="text-lg">{check.passed ? '✅' : '⚠️'}</span>
            <div>
              <p className="text-sm font-medium text-white">{check.label}</p>
              <p className="text-xs text-cyber-muted mt-0.5">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityCheckList;
