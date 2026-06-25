/**
 * pages/History.jsx
 * -----------------
 * Scan history page — placeholder for a future milestone.
 */

import DashboardLayout from '../layouts/DashboardLayout';
import PlaceholderCard from '../components/PlaceholderCard';

function History() {
  return (
    <DashboardLayout title="History">
      <PlaceholderCard
        icon="📜"
        title="Scan History"
        description="Browse your past scans and results. Filter by type, date, or threat level."
      />
    </DashboardLayout>
  );
}

export default History;
