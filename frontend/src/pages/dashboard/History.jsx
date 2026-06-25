/**
 * pages/dashboard/History.jsx
 *
 * Full URL scan history table for the logged-in user.
 */

import { useState, useEffect } from 'react';
import { getUrlHistory } from '../../services/urlService';
import ScanHistoryTable from '../../components/url/ScanHistoryTable';

function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getUrlHistory(50);
        setScans(response.data);
      } catch {
        setScans([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Scan History</h1>
        <p className="text-cyber-muted text-sm">
          All URL scans performed on your account, newest first.
        </p>
      </div>

      <ScanHistoryTable
        scans={scans}
        loading={loading}
        emptyMessage="No scan history yet. Visit the URL Scanner to analyze links."
      />
    </div>
  );
}

export default History;
