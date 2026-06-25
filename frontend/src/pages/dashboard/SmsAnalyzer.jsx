/**
 * pages/dashboard/SmsAnalyzer.jsx
 *
 * Active SMS / smishing analyzer with form, result cards, and history.
 */

import { useEffect, useState } from 'react';
import { analyzeSms, getSmsHistory } from '../../services/smsService';

function SmsAnalyzer() {
  const [form, setForm] = useState({ senderNumber: '', message: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      const response = await getSmsHistory();
      setHistory(response.data);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await analyzeSms(form);
      setResult(response.data);
      setForm({ senderNumber: '', message: '' });
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'SMS analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">SMS Analyzer</h1>
        <p className="text-cyber-muted text-sm">
          Detect smishing attempts, shortened links, and urgent social-engineering language.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <input
          value={form.senderNumber}
          onChange={(e) => setForm({ ...form, senderNumber: e.target.value })}
          className="w-full bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
          placeholder="Sender number (optional)"
        />
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={6}
          className="w-full bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
          placeholder="Paste the SMS message here..."
          required
        />
        {error && <p className="text-sm text-cyber-danger">{error}</p>}
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze SMS'}
        </button>
      </form>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-cyber-muted text-sm mb-2">Risk Score</p>
            <p className="text-4xl font-bold text-white">{result.riskScore}</p>
            <p className="text-cyber-accent mt-2">{result.riskLevel}</p>
          </div>
          <div className="card lg:col-span-2">
            <h3 className="text-white font-semibold mb-2">Summary</h3>
            <p className="text-gray-300 text-sm">{result.summary || 'No AI summary available.'}</p>
            <div className="mt-4">
              <h4 className="text-white text-sm font-medium mb-2">Reasons</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {result.reasons?.map((reason, index) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-white font-semibold mb-4">Recent SMS Scans</h3>
        {history.length === 0 ? (
          <p className="text-cyber-muted text-sm">No SMS scans yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="border border-cyber-border rounded-lg p-4">
                <p className="text-white text-sm">{item.senderNumber || 'Unknown sender'}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-cyber-accent">{item.riskLevel}</span>
                  <span className="text-white">{item.riskScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SmsAnalyzer;
