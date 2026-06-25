/**
 * pages/dashboard/EmailAnalyzer.jsx
 *
 * Email Analyzer page placeholder.
 */

import PlaceholderCard from '../../components/PlaceholderCard';

function EmailAnalyzer() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Email Analyzer</h1>
      <p className="text-cyber-muted text-sm mb-8">
        Paste email content to detect phishing attempts and malicious patterns.
      </p>

      <PlaceholderCard
        title="Email Phishing Detection"
        description="AI will analyze sender patterns, urgency language, suspicious links, and credential harvesting attempts in email content."
        icon="📧"
      />
    </div>
  );
}

export default EmailAnalyzer;
