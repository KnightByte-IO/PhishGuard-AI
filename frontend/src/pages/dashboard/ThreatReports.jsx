/**
 * pages/dashboard/ThreatReports.jsx
 *
 * Threat Reports list — all URL scans with links to full reports.
 * Shows AI badge when Gemini explanation is available.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getThreatReports } from '../../services/urlService';
import ThreatReportCard from '../../components/threat/ThreatReportCard';

function ThreatReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getThreatReports(30);
        setReports(response.data);
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Threat Reports</h1>
          <p className="text-cyber-muted text-sm">
            Detailed security reports from your URL scans — rule-based analysis + AI explanations.
          </p>
        </div>
        <Link to="/url-scanner" className="btn-primary text-center text-sm">
          New Scan
        </Link>
      </div>

      {loading ? (
        <div className="card text-center py-12 text-cyber-muted">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-cyber-muted mb-4">No threat reports yet.</p>
          <Link to="/url-scanner" className="text-cyber-accent hover:underline text-sm">
            Scan your first URL →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((scan) => (
            <ThreatReportCard key={scan._id} scan={scan} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ThreatReports;
