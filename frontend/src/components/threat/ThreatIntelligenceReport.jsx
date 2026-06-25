/**
 * components/threat/ThreatIntelligenceReport.jsx
 *
 * Full Threat Intelligence Report — displays combined results from:
 * Rule Engine, VirusTotal, WHOIS, Google Safe Browsing, and URLScan.io
 */

import ConfidenceMeter from './ConfidenceMeter';
import RiskScoreGauge from '../url/RiskScoreGauge';
import { getRiskStyle } from '../../utils/riskHelpers';

/**
 * Reusable card for a single intelligence source.
 */
function SourceCard({ title, icon, available, error, children }) {
  return (
    <div
      className={`card ${
        available
          ? 'border-cyber-border'
          : 'border-cyber-warning/30 bg-cyber-warning/5'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded ${
            available
              ? 'bg-cyber-success/10 text-cyber-success'
              : 'bg-cyber-warning/10 text-cyber-warning'
          }`}
        >
          {available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {!available ? (
        <p className="text-xs text-cyber-muted">{error || 'Source unavailable'}</p>
      ) : (
        children
      )}
    </div>
  );
}

function ThreatIntelligenceReport({ scan, loading }) {
  if (loading) {
    return (
      <div className="card border border-cyber-accent/30 bg-cyber-accent/5">
        <div className="flex items-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-cyber-accent border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-cyber-accent font-medium text-sm">
              Running Threat Intelligence Scan...
            </p>
            <p className="text-cyber-muted text-xs mt-1">
              Querying VirusTotal, WHOIS, Safe Browsing, and URLScan.io — this may take up to 60 seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!scan?.intelligenceGenerated) return null;

  const finalStyle = getRiskStyle(scan.finalThreatLevel || scan.riskLevel);
  const vt = scan.virusTotal || {};
  const whois = scan.whois || {};
  const sb = scan.safeBrowsing || {};
  const us = scan.urlScan || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-lg">🛡️</span>
        <h3 className="text-lg font-semibold text-white">Threat Intelligence Report</h3>
        <span className="text-xs font-mono text-cyber-accent bg-cyber-accent/10 px-2 py-0.5 rounded">
          Multi-Source
        </span>
      </div>

      {/* Final aggregated scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskScoreGauge
          score={scan.finalRiskScore ?? scan.riskScore}
          level={scan.finalThreatLevel ?? scan.riskLevel}
        />
        <div className="lg:col-span-2 space-y-4">
          <ConfidenceMeter
            confidence={scan.confidence}
            sourcesUsed={scan.intelligenceSourcesUsed}
            sourcesFailed={scan.intelligenceSourcesFailed}
          />

          <div className={`card ${finalStyle.border} border`}>
            <h4 className="text-sm font-semibold text-white mb-2">Final Recommendation</h4>
            <ul className="space-y-2">
              {(scan.intelligenceRecommendation || []).map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className={`${finalStyle.text} mt-0.5`}>→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center p-4">
          <p className="text-xs text-cyber-muted mb-1">Rule Engine</p>
          <p className="text-2xl font-bold text-white">{scan.riskScore}</p>
        </div>
        <div className="card text-center p-4">
          <p className="text-xs text-cyber-muted mb-1">Final Score</p>
          <p className={`text-2xl font-bold ${finalStyle.text}`}>
            {scan.finalRiskScore}
          </p>
        </div>
        <div className="card text-center p-4">
          <p className="text-xs text-cyber-muted mb-1">Threat Level</p>
          <p className={`text-lg font-bold ${finalStyle.text}`}>
            {scan.finalThreatLevel}
          </p>
        </div>
        <div className="card text-center p-4">
          <p className="text-xs text-cyber-muted mb-1">Confidence</p>
          <p className="text-2xl font-bold text-cyber-accent">{scan.confidence}%</p>
        </div>
      </div>

      {/* Individual source results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VirusTotal */}
        <SourceCard
          title="VirusTotal"
          icon="🦠"
          available={vt.available}
          error={vt.error}
        >
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 rounded bg-cyber-danger/10">
              <p className="text-lg font-bold text-cyber-danger">{vt.maliciousCount}</p>
              <p className="text-xs text-cyber-muted">Malicious</p>
            </div>
            <div className="text-center p-2 rounded bg-cyber-warning/10">
              <p className="text-lg font-bold text-cyber-warning">{vt.suspiciousCount}</p>
              <p className="text-xs text-cyber-muted">Suspicious</p>
            </div>
            <div className="text-center p-2 rounded bg-cyber-success/10">
              <p className="text-lg font-bold text-cyber-success">{vt.harmlessCount}</p>
              <p className="text-xs text-cyber-muted">Harmless</p>
            </div>
          </div>
          {vt.detectedVendors?.length > 0 && (
            <div>
              <p className="text-xs text-cyber-muted mb-2">Detected by:</p>
              <div className="flex flex-wrap gap-1">
                {vt.detectedVendors.slice(0, 8).map((v, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded bg-cyber-darker text-gray-400"
                  >
                    {v.vendor}
                  </span>
                ))}
                {vt.detectedVendors.length > 8 && (
                  <span className="text-xs text-cyber-muted">
                    +{vt.detectedVendors.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </SourceCard>

        {/* WHOIS */}
        <SourceCard
          title="WHOIS / Domain Info"
          icon="📋"
          available={whois.available}
          error={whois.error}
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-cyber-muted">Registrar</dt>
              <dd className="text-white text-right">{whois.registrar}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cyber-muted">Country</dt>
              <dd className="text-white">{whois.country}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cyber-muted">Domain Age</dt>
              <dd className="text-white">
                {whois.domainAgeDays != null ? `${whois.domainAgeDays} days` : 'Unknown'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cyber-muted">Registered</dt>
              <dd className="text-white text-xs">
                {whois.registrationDate
                  ? new Date(whois.registrationDate).toLocaleDateString()
                  : 'Unknown'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cyber-muted">Expires</dt>
              <dd className="text-white text-xs">
                {whois.expirationDate
                  ? new Date(whois.expirationDate).toLocaleDateString()
                  : 'Unknown'}
              </dd>
            </div>
          </dl>
        </SourceCard>

        {/* Safe Browsing */}
        <SourceCard
          title="Google Safe Browsing"
          icon="🔒"
          available={sb.available}
          error={sb.error}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cyber-muted">Overall Status</span>
              <span
                className={`text-sm font-semibold ${
                  sb.safe ? 'text-cyber-success' : 'text-cyber-danger'
                }`}
              >
                {sb.safe ? '✅ Safe' : '⚠️ Threat Detected'}
              </span>
            </div>
            {[
              { label: 'Phishing', value: sb.phishing },
              { label: 'Malware', value: sb.malware },
              { label: 'Unwanted Software', value: sb.unwantedSoftware },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-cyber-muted">{item.label}</span>
                <span className={item.value ? 'text-cyber-danger' : 'text-cyber-success'}>
                  {item.value ? 'Detected' : 'Clear'}
                </span>
              </div>
            ))}
          </div>
        </SourceCard>

        {/* URLScan */}
        <SourceCard
          title="URLScan.io"
          icon="🔬"
          available={us.available}
          error={us.error}
        >
          {us.dataSource === 'historical' && (
            <p className="text-xs text-cyber-muted mb-3">
              Live scan blocked — showing archived public scan data.
            </p>
          )}
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-cyber-muted text-xs">Final URL</dt>
              <dd className="text-white font-mono text-xs break-all">{us.finalUrl}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cyber-muted">Page Title</dt>
              <dd className="text-white text-right truncate max-w-[60%]">{us.pageTitle}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cyber-muted">IP Address</dt>
              <dd className="text-white font-mono">{us.ipAddress || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cyber-muted">Hosting</dt>
              <dd className="text-white text-right">{us.hostingProvider}</dd>
            </div>
            {us.redirectChain?.length > 0 && (
              <div>
                <dt className="text-cyber-muted text-xs mb-1">Redirect Chain</dt>
                <dd className="space-y-1">
                  {us.redirectChain.map((url, i) => (
                    <p key={i} className="text-xs font-mono text-gray-400 truncate">
                      {i + 1}. {url}
                    </p>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </SourceCard>
      </div>
    </div>
  );
}

export default ThreatIntelligenceReport;
