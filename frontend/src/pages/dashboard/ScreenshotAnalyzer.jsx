/**
 * pages/dashboard/ScreenshotAnalyzer.jsx
 *
 * Screenshot Analyzer page placeholder.
 */

import PlaceholderCard from '../../components/PlaceholderCard';

function ScreenshotAnalyzer() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Screenshot Analyzer</h1>
      <p className="text-cyber-muted text-sm mb-8">
        Upload website screenshots for visual phishing detection.
      </p>

      <PlaceholderCard
        title="Visual Phishing Analysis"
        description="Upload a screenshot of a suspicious website. AI will inspect logos, login forms, URL bars, and visual impersonation indicators."
        icon="📸"
      />
    </div>
  );
}

export default ScreenshotAnalyzer;
