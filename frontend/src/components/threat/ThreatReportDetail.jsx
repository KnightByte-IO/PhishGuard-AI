/**
 * components/threat/ThreatReportDetail.jsx
 *
 * Full threat report view — rule-based scan, AI explanation, and threat intelligence.
 */

import { Link } from 'react-router-dom';
import RiskScoreGauge from '../url/RiskScoreGauge';
import SecurityCheckList from '../url/SecurityCheckList';
import AiExplanationPanel from './AiExplanationPanel';
import ThreatIntelligenceReport from './ThreatIntelligenceReport';
import ThreatTimeline from './ThreatTimeline';
import { getRiskStyle } from '../../utils/riskHelpers';

function ThreatReportDetail({
  scan,
  aiAvailable,
  aiError,
  explanationSource,
  onGenerateAi,
  aiLoading,
  onRunIntelligence,
  intelligenceLoading,
}) {
  if (!scan) return null;

  const style = getRiskStyle(scan.riskLevel);
  const displayScore = scan.finalRiskScore ?? scan.riskScore;
  const displayLevel = scan.finalThreatLevel ?? scan.riskLevel;
  const finalStyle = getRiskStyle(displayLevel);

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

        <div className="flex flex-wrap gap-2">
          {!scan.intelligenceGenerated && (
            <button
              onClick={onRunIntelligence}
              disabled={intelligenceLoading}
              className="btn-primary whitespace-nowrap disabled:opacity-50 text-sm"
            >
              {intelligenceLoading ? 'Scanning...' : '🛡️ Run Intelligence Scan'}
            </button>
          )}
          {!scan.aiGenerated && (
            <button
              onClick={onGenerateAi}
              disabled={aiLoading}
              className="btn-secondary whitespace-nowrap disabled:opacity-50 text-sm"
            >
              {aiLoading ? 'Generating...' : '🤖 AI Explanation'}
            </button>
          )}
        </div>
      </div>

      {/* Overall Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RiskScoreGauge score={displayScore} level={displayLevel} />
        <div className="lg:col-span-3 card">
          <h3 className="text-sm font-medium text-cyber-muted mb-3">Overall Risk Assessment</h3>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`text-4xl font-bold ${finalStyle.text}`}>{displayScore}%</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${finalStyle.bg} ${finalStyle.text} ${finalStyle.border} border`}
            >
              {displayLevel}
            </span>
            {scan.attackType && (
              <span className="px-3 py-1 rounded-full text-sm bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/30">
                {scan.attackType}
              </span>
            )}
            {scan.confidence != null && (
              <span className="px-3 py-1 rounded-full text-sm bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30">
                {scan.confidence}% confidence
              </span>
            )}
          </div>
          <p className="text-xs text-cyber-muted">
            {scan.intelligenceGenerated
              ? 'Final score aggregated from rule engine + external threat intelligence sources.'
              : 'Rule-based score — run Intelligence Scan for multi-source analysis.'}
          </p>
        </div>
      </div>

      {/* Threat Intelligence Report */}
      {(scan.intelligenceGenerated || intelligenceLoading) && (
        <ThreatIntelligenceReport scan={scan} loading={intelligenceLoading} />
      )}

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
          explanationSource={explanationSource}
        />
      )}

      {/* Timeline */}
      <ThreatTimeline scan={scan} />
    </div>
  );
}

export default ThreatReportDetail;
