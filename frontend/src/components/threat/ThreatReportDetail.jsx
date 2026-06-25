/**
 * components/threat/ThreatReportDetail.jsx
 *
 * Full threat report view — combines rule-based scan + AI explanation + timeline.
 */

import { Link } from 'react-router-dom';
import RiskScoreGauge from '../url/RiskScoreGauge';
import SecurityCheckList from '../url/SecurityCheckList';
import AiExplanationPanel from './AiExplanationPanel';
import ThreatTimeline from './ThreatTimeline';
import { getRiskStyle } from '../../utils/riskHelpers';

function ThreatReportDetail({ scan, aiAvailable, aiError, onGenerateAi, aiLoading }) {
  if (!scan) return null;

  const style = getRiskStyle(scan.riskLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/dashboard/threat-reports"
            className="text-cyber-accent text-sm hover:underline mb-2 inline-block"
          >
            ← Back to Threat Reports
          </Link>
          <h2 className="text-xl font-bold text-white">Threat Report</h2>
          <p className="text-cyber-muted text-sm font-mono truncate max-w-xl mt-1">
            {scan.originalUrl}
          </p>
        </div>

        {!scan.aiGenerated && (
          <button
            onClick={onGenerateAi}
            disabled={aiLoading}
            className="btn-primary whitespace-nowrap disabled:opacity-50"
          >
            {aiLoading ? 'Generating...' : '🤖 Generate AI Explanation'}
          </button>
        )}
      </div>

      {/* Overall Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RiskScoreGauge score={scan.riskScore} level={scan.riskLevel} />
        <div className="lg:col-span-3 card">
          <h3 className="text-sm font-medium text-cyber-muted mb-3">Overall Risk Assessment</h3>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`text-4xl font-bold ${style.text}`}>{scan.riskScore}%</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text} ${style.border} border`}
            >
              {scan.riskLevel}
            </span>
            {scan.attackType && (
              <span className="px-3 py-1 rounded-full text-sm bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/30">
                {scan.attackType}
              </span>
            )}
          </div>
          <p className="text-xs text-cyber-muted">
            Risk score determined by rule-based URL scanner — not by AI.
          </p>
        </div>
      </div>

      {/* Rule-based security report (always shown) */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Rule-Based Security Report
        </h3>
        <SecurityCheckList scan={scan} />

        <div className={`card mt-4 ${style.border} border`}>
          <h4 className="text-sm font-semibold text-white mb-3">Scanner Reasons</h4>
          <ul className="space-y-2">
            {(scan.reasons || []).map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className={`${style.text} mt-0.5`}>•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Explanation section */}
      {(scan.aiGenerated || aiLoading || aiError) && (
        <AiExplanationPanel
          scan={scan}
          aiAvailable={aiAvailable}
          aiError={aiError}
          loading={aiLoading}
        />
      )}

      {/* Timeline */}
      <ThreatTimeline scan={scan} />
    </div>
  );
}

export default ThreatReportDetail;
