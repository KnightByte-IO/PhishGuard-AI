/**
 * pages/EmailAnalyzer.jsx
 * -----------------------
 * Email Analyzer page — placeholder for a future milestone.
 */

import DashboardLayout from '../layouts/DashboardLayout';
import PlaceholderCard from '../components/PlaceholderCard';

function EmailAnalyzer() {
  return (
    <DashboardLayout title="Email Analyzer">
      <PlaceholderCard
        icon="📧"
        title="Email Analyzer"
        description="Paste email content or headers to detect phishing attempts, spoofed senders, and malicious links."
      />
    </DashboardLayout>
  );
}

export default EmailAnalyzer;
