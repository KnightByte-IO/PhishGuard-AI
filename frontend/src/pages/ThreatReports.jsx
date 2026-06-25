/**
 * pages/ThreatReports.jsx
 * -----------------------
 * Threat Reports page — placeholder for a future milestone.
 */

import DashboardLayout from '../layouts/DashboardLayout';
import PlaceholderCard from '../components/PlaceholderCard';

function ThreatReports() {
  return (
    <DashboardLayout title="Threat Reports">
      <PlaceholderCard
        icon="⚠️"
        title="Threat Reports"
        description="View detailed reports of all detected threats with risk scores, classifications, and AI explanations."
      />
    </DashboardLayout>
  );
}

export default ThreatReports;
