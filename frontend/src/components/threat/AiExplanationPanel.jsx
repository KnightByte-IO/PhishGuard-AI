/**
 * components/threat/AiExplanationPanel.jsx
 *
 * Displays Gemini-generated threat explanation.
 * Falls back gracefully when AI is unavailable — rule-based report still shows.
 */

import { getRiskStyle } from '../../utils/riskHelpers';

function AiExplanationPanel({ scan, aiAvailable, aiError, loading, explanationSource }) {
  if (loading) {
    return (
      <div className="card border border-cyber-accent/30 bg-cyber-accent/5">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyber-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-cyber-accent text-sm">Generating AI threat explanation...</p>
        </div>
      </div>
    );
  }

  if (!aiAvailable) {
    return (
      <div className="card border border-cyber-warning/30 bg-cyber-warning/5">
        <div className="flex items-start gap-3">
          <span className="text-xl">🤖</span>
          <div>
            <p className="text-cyber-warning font-medium text-sm">
              {aiError || 'AI explanation unavailable.'}
            </p>
            <p className="text-cyber-muted text-xs mt-1">
              The rule-based security report above is still valid and was used to assess this URL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const style = getRiskStyle(scan.riskLevel);

  const isGemini = explanationSource === 'gemini' || scan.explanationSource === 'gemini';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🤖</span>
        <h3 className="text-lg font-semibold text-white">Threat Explanation</h3>
        <span className="text-xs font-mono text-cyber-accent bg-cyber-accent/10 px-2 py-0.5 rounded">
          {isGemini ? 'Powered by Gemini' : 'Smart Analysis'}
        </span>
      </div>

      {/* Summary + Attack Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`card md:col-span-2 ${style.border} border`}>
          <h4 className="text-sm font-medium text-cyber-muted mb-2">Summary</h4>
          <p className="text-white text-sm leading-relaxed">{scan.summary}</p>
        </div>
        <div className={`card border ${style.border} ${style.bg}`}>
          <h4 className="text-sm font-medium text-cyber-muted mb-2">Threat Type</h4>
          <p className={`${style.text} font-semibold text-lg`}>{scan.attackType}</p>
        </div>
      </div>

      {/* AI Reasons + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-3">Detailed Analysis</h4>
          <ul className="space-y-2">
            {(scan.aiReasons || []).map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className={`${style.text} mt-0.5`}>•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="card border border-cyber-accent/30">
          <h4 className="text-sm font-semibold text-white mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {(scan.recommendations || []).map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-cyber-accent mt-0.5">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Security Tips */}
      <div className="card bg-cyber-darker/50">
        <h4 className="text-sm font-semibold text-white mb-3">Security Tips</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(scan.securityTips || []).map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 rounded-lg bg-cyber-card border border-cyber-border text-sm text-gray-300"
            >
              <span className="text-cyber-success shrink-0">💡</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AiExplanationPanel;
