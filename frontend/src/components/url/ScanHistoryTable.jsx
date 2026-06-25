/**
 * components/url/ScanHistoryTable.jsx
 *
 * Table showing past URL scans with risk score and level.
 */

import { getRiskStyle } from '../../utils/riskHelpers';

function ScanHistoryTable({ scans, loading, emptyMessage }) {
  if (loading) {
    return (
      <div className="card text-center py-8 text-cyber-muted">
        Loading scan history...
      </div>
    );
  }

  if (!scans?.length) {
    return (
      <div className="card text-center py-8 text-cyber-muted">
        {emptyMessage || 'No scans yet. Analyze a URL to get started.'}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyber-border bg-cyber-darker/50">
              <th className="text-left px-6 py-3 text-cyber-muted font-medium">URL</th>
              <th className="text-left px-6 py-3 text-cyber-muted font-medium">Hostname</th>
              <th className="text-center px-6 py-3 text-cyber-muted font-medium">Score</th>
              <th className="text-center px-6 py-3 text-cyber-muted font-medium">Level</th>
              <th className="text-right px-6 py-3 text-cyber-muted font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => {
              const style = getRiskStyle(scan.riskLevel);
              return (
                <tr
                  key={scan._id}
                  className="border-b border-cyber-border/50 hover:bg-cyber-darker/30 transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-xs text-gray-300 max-w-xs truncate">
                    {scan.originalUrl}
                  </td>
                  <td className="px-6 py-3 text-gray-400">{scan.hostname}</td>
                  <td className={`px-6 py-3 text-center font-bold ${style.text}`}>
                    {scan.riskScore}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      {scan.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-cyber-muted text-xs">
                    {new Date(scan.analysisDate).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ScanHistoryTable;
