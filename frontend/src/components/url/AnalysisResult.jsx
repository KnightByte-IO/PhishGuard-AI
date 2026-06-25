/**
 * components/url/AnalysisResult.jsx
 *
 * Full rule-based analysis output with optional AI explanation trigger.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import RiskScoreGauge from './RiskScoreGauge';
import SecurityCheckList from './SecurityCheckList';
import AiExplanationPanel from '../threat/AiExplanationPanel';
import { getRiskStyle } from '../../utils/riskHelpers';
import { explainUrl } from '../../services/urlService';

function AnalysisResult({ scan: initialScan, onScanUpdate }) {
  const [scan, setScan] = useState(initialScan);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(initialScan?.aiGenerated || false);
  const [aiError, setAiError] = useState(null);

  if (!scan) return null;

  const style = getRiskStyle(scan.riskLevel);

  const handleGenerateAi = async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await explainUrl(scan._id);
      setScan(response.data);
      setAiAvailable(response.aiAvailable);
      if (!response.aiAvailable) {
        setAiError(response.aiError || 'AI explanation unavailable.');
      }
      onScanUpdate?.(response.data);
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI explanation unavailable.');
      setAiAvailable(false);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskScoreGauge score={scan.riskScore} level={scan.riskLevel} />

        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-white mb-4">URL Details</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-cyber-muted">Original URL</dt>
              <dd className="text-white font-mono break-all mt-1">{scan.originalUrl}</dd>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <dt className="text-cyber-muted text-xs">Hostname</dt>
                <dd className="text-white font-mono truncate">{scan.hostname}</dd>
              </div>
              <div>
                <dt className="text-cyber-muted text-xs">HTTPS</dt>
                <dd className={scan.isHttps ? 'text-cyber-success' : 'text-cyber-danger'}>
                  {scan.isHttps ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-cyber-muted text-xs">Scanned</dt>
                <dd className="text-white">
                  {new Date(scan.analysisDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-cyber-muted text-xs">Report</dt>
                <dd>
                  <Link
                    to={`/dashboard/threat-reports/${scan._id}`}
                    className="text-cyber-accent hover:underline text-xs"
                  >
                    View full report →
                  </Link>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      <SecurityCheckList scan={scan} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`card ${style.border} border`}>
          <h3 className="text-lg font-semibold text-white mb-3">Scanner Reasons</h3>
          <ul className="space-y-2">
            {scan.reasons?.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className={`${style.text} mt-0.5`}>•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="card border border-cyber-accent/30">
          <h3 className="text-lg font-semibold text-white mb-3">Scanner Suggestions</h3>
          <ul className="space-y-2">
            {scan.suggestions?.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-cyber-accent mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Explanation trigger */}
      {!scan.aiGenerated && !aiLoading && !aiError && (
        <div className="card border border-cyber-accent/20 bg-cyber-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold">Want a detailed explanation?</h3>
              <p className="text-cyber-muted text-sm mt-1">
                Gemini AI will explain these scanner findings in plain language — it will not change the risk score.
              </p>
            </div>
            <button
              onClick={handleGenerateAi}
              className="btn-primary whitespace-nowrap"
            >
              🤖 Generate AI Explanation
            </button>
          </div>
        </div>
      )}

      {(scan.aiGenerated || aiLoading || aiError) && (
        <AiExplanationPanel
          scan={scan}
          aiAvailable={aiAvailable}
          aiError={aiError}
          loading={aiLoading}
        />
      )}
    </div>
  );
}

export default AnalysisResult;
