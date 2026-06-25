/**
 * pages/dashboard/EmailAnalyzer.jsx
 *
 * Active email phishing analyzer with form, result cards, and history.
 */

import { useEffect, useState } from 'react';
import { analyzeEmail, getEmailHistory } from '../../services/emailService';

function EmailAnalyzer() {
  const [form, setForm] = useState({ sender: '', subject: '', content: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      const response = await getEmailHistory();
      setHistory(response.data);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await analyzeEmail(form);
      setResult(response.data);
      setForm({ sender: '', subject: '', content: '' });
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Email analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Email Analyzer</h1>
        <p className="text-cyber-muted text-sm">
          Analyze suspicious emails for urgency, credential theft, and phishing links.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="sender"
            value={form.sender}
            onChange={handleChange}
            className="bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
            placeholder="Sender email (optional)"
          />
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
            placeholder="Subject line (optional)"
          />
        </div>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={8}
          className="w-full bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
          placeholder="Paste the full email content here..."
          required
        />
        {error && <p className="text-sm text-cyber-danger">{error}</p>}
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Email'}
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
        <h3 className="text-white font-semibold mb-4">Recent Email Scans</h3>
        {history.length === 0 ? (
          <p className="text-cyber-muted text-sm">No email scans yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="border border-cyber-border rounded-lg p-4">
                <p className="text-white text-sm font-medium">{item.subject || 'No subject'}</p>
                <p className="text-cyber-muted text-xs">{item.sender || 'Unknown sender'}</p>
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

export default EmailAnalyzer;
