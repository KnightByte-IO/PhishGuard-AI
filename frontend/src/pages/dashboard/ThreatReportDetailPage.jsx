/**
 * pages/dashboard/ThreatReportDetailPage.jsx
 *
 * Single threat report detail view with rule-based + AI explanation.
 * Route: /dashboard/threat-reports/:scanId
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getThreatReport, explainUrl } from '../../services/urlService';
import ThreatReportDetail from '../../components/threat/ThreatReportDetail';

function ThreatReportDetailPage() {
  const { scanId } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getThreatReport(scanId);
        setScan(response.data);
        setAiAvailable(response.data.aiGenerated);
      } catch (err) {
        setError(err.response?.data?.message || 'Report not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scanId]);

  const handleGenerateAi = async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await explainUrl(scanId);
      setScan(response.data);
      setAiAvailable(response.aiAvailable);
      if (!response.aiAvailable) {
        setAiError(response.aiError || 'AI explanation unavailable.');
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI explanation unavailable.');
      setAiAvailable(false);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-cyber-muted">Loading threat report...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-cyber-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <ThreatReportDetail
        scan={scan}
        aiAvailable={aiAvailable}
        aiError={aiError}
        onGenerateAi={handleGenerateAi}
        aiLoading={aiLoading}
      />
    </div>
  );
}

export default ThreatReportDetailPage;
