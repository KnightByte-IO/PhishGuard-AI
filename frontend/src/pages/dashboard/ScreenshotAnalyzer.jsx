/**
 * pages/dashboard/ScreenshotAnalyzer.jsx
 *
 * Active screenshot analyzer using image upload + Gemini visual inspection.
 */

import { useEffect, useState } from 'react';
import {
  analyzeScreenshot,
  getScreenshotHistory,
} from '../../services/screenshotService';

function ScreenshotAnalyzer() {
  const [fileName, setFileName] = useState('');
  const [imageData, setImageData] = useState('');
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      const response = await getScreenshotHistory();
      setHistory(response.data);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageData) {
      setError('Please choose an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analyzeScreenshot({ fileName, imageData });
      setResult(response.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Screenshot analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Screenshot Analyzer</h1>
        <p className="text-cyber-muted text-sm">
          Upload a suspicious screenshot and inspect it for phishing visuals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300"
        />

        {preview && (
          <div className="border border-cyber-border rounded-lg p-4 bg-cyber-darker">
            <img
              src={preview}
              alt="Screenshot preview"
              className="max-h-72 rounded-lg mx-auto"
            />
          </div>
        )}

        {error && <p className="text-sm text-cyber-danger">{error}</p>}
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Screenshot'}
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
            <h3 className="text-white font-semibold mb-2">Visual Summary</h3>
            <p className="text-gray-300 text-sm">{result.summary}</p>
            <div className="mt-4">
              <h4 className="text-white text-sm font-medium mb-2">Indicators</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {(result.visualIndicators || result.reasons || []).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-white font-semibold mb-4">Recent Screenshot Scans</h3>
        {history.length === 0 ? (
          <p className="text-cyber-muted text-sm">No screenshot scans yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="border border-cyber-border rounded-lg p-4">
                <p className="text-white text-sm">{item.fileName}</p>
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

export default ScreenshotAnalyzer;
