/**
 * pages/UrlScanner.jsx
 * --------------------
 * URL Scanner page — placeholder for Milestone 2+.
 */

import DashboardLayout from '../layouts/DashboardLayout';
import PlaceholderCard from '../components/PlaceholderCard';

function UrlScanner() {
  return (
    <DashboardLayout title="URL Scanner">
      <PlaceholderCard
        icon="🔗"
        title="URL Scanner"
        description="Paste any suspicious URL to analyze it for phishing indicators like domain spoofing, typosquatting, and credential harvesting."
      />
    </DashboardLayout>
  );
}

export default UrlScanner;
