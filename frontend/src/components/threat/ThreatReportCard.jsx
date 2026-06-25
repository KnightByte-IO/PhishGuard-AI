/**
 * components/threat/ThreatReportCard.jsx
 *
 * Compact card for threat report list — used on Threat Reports page and Dashboard.
 */

import { Link } from 'react-router-dom';
import { getRiskStyle } from '../../utils/riskHelpers';

function ThreatReportCard({ scan, showAiBadge = true }) {
  const style = getRiskStyle(scan.riskLevel);

  return (
    <Link
      to={`/dashboard/threat-reports/${scan._id}`}
      className="card hover:border-cyber-accent/40 transition-colors block"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-mono truncate">{scan.originalUrl}</p>
          <p className="text-xs text-cyber-muted mt-1">
            {new Date(scan.analysisDate).toLocaleString()}
          </p>
          {scan.summary && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{scan.summary}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-lg font-bold ${style.text}`}>{scan.riskScore}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${style.bg} ${style.text}`}
          >
            {scan.riskLevel}
          </span>
          {showAiBadge && scan.aiGenerated && (
            <span className="text-xs text-cyber-accent bg-cyber-accent/10 px-2 py-0.5 rounded">
              AI ✓
            </span>
          )}
          {scan.intelligenceGenerated && (
            <span className="text-xs text-cyber-warning bg-cyber-warning/10 px-2 py-0.5 rounded">
              Intel ✓
            </span>
          )}
          {scan.attackType && (
            <span className="text-xs text-cyber-danger">{scan.attackType}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ThreatReportCard;
