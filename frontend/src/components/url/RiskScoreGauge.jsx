/**
 * components/url/RiskScoreGauge.jsx
 *
 * Visual circular-style risk score display with color-coded level.
 */

import { getRiskStyle } from '../../utils/riskHelpers';

function RiskScoreGauge({ score, level }) {
  const style = getRiskStyle(level);

  return (
    <div className={`card text-center ${style.border} border-2`}>
      <p className="text-cyber-muted text-sm mb-2">Risk Score</p>

      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-cyber-border"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 264} 264`}
            className={style.text}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${style.text}`}>{score}</span>
          <span className="text-cyber-muted text-xs">/ 100</span>
        </div>
      </div>

      <span
        className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${style.bg} ${style.text} ${style.border} border`}
      >
        {level}
      </span>
    </div>
  );
}

export default RiskScoreGauge;
