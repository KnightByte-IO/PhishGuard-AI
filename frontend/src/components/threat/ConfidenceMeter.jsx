/**
 * components/threat/ConfidenceMeter.jsx
 *
 * Visual meter showing how many threat intelligence sources responded.
 * 100% = all sources available; lower = some APIs failed gracefully.
 */

function ConfidenceMeter({ confidence, sourcesUsed = [], sourcesFailed = [] }) {
  const value = confidence ?? 0;

  const getColor = () => {
    if (value >= 80) return 'bg-cyber-success';
    if (value >= 50) return 'bg-cyber-warning';
    return 'bg-cyber-danger';
  };

  return (
    <div className="card">
      <h4 className="text-sm font-semibold text-white mb-3">Confidence Score</h4>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-3xl font-bold text-white">{value}%</span>
        <div className="flex-1 h-3 bg-cyber-darker rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-cyber-muted mb-3">
        Based on {sourcesUsed.length} of 5 intelligence sources responding.
      </p>

      {sourcesUsed.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {sourcesUsed.map((source) => (
            <span
              key={source}
              className="text-xs px-2 py-0.5 rounded bg-cyber-success/10 text-cyber-success border border-cyber-success/20"
            >
              ✓ {source}
            </span>
          ))}
        </div>
      )}

      {sourcesFailed.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sourcesFailed.map((source) => (
            <span
              key={source}
              className="text-xs px-2 py-0.5 rounded bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/20"
            >
              ✗ {source}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConfidenceMeter;
