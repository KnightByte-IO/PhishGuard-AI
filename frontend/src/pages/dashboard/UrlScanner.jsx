/**
 * pages/dashboard/UrlScanner.jsx
 *
 * URL Intelligence Engine — analyze URLs with rule-based security checks.
 * Route: /url-scanner (also /dashboard/url-scanner redirects here)
 */

import { useState, useEffect } from 'react';
import { analyzeUrl, getUrlHistory } from '../../services/urlService';
import AnalysisResult from '../../components/url/AnalysisResult';
import ScanHistoryTable from '../../components/url/ScanHistoryTable';

function UrlScanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await getUrlHistory(10);
      setHistory(response.data);
    } catch {
      // History load failure is non-critical
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await analyzeUrl(url);
      setResult(response.data);
      setUrl('');
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">URL Scanner</h1>
        <p className="text-cyber-muted text-sm">
          Rule-based URL intelligence — detect phishing indicators without external APIs.
        </p>
      </div>

      {/* URL input form */}
      <form onSubmit={handleAnalyze} className="card mb-8">
        <label htmlFor="url-input" className="block text-sm font-medium text-white mb-2">
          Enter URL to analyze
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="url-input"
            type="text"
            className="flex-1 bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-cyber-muted focus:outline-none focus:border-cyber-accent transition-colors"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn-primary px-8 py-3 whitespace-nowrap disabled:opacity-50"
            disabled={loading || !url.trim()}
          >
            {loading ? 'Analyzing...' : 'Analyze URL'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-cyber-danger bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
      </form>

      {/* Analysis results */}
      {result && <AnalysisResult scan={result} />}

      {/* Scan history */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Scans</h2>
        <ScanHistoryTable
          scans={history}
          loading={historyLoading}
          emptyMessage="No URL scans yet. Enter a URL above and click Analyze."
        />
      </div>
    </div>
  );
}

export default UrlScanner;
