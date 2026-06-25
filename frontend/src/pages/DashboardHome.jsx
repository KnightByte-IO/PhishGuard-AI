/**
 * pages/DashboardHome.jsx
 * -----------------------
 * Main dashboard page — welcome message and quick stats placeholders.
 */

import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

function DashboardHome() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-400">
          Your security command center. Use the sidebar to navigate analyzers.
        </p>
      </div>

      {/* Quick stats — placeholders for future milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Scans</p>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Threats Detected</p>
          <p className="text-3xl font-bold text-cyber-danger">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Safe Results</p>
          <p className="text-3xl font-bold text-cyber-safe">0</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-2">Getting Started</h3>
        <p className="text-gray-400 text-sm mb-4">
          Milestone 1 is complete! In upcoming milestones you will be able to:
        </p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <span className="text-cyber-accent">→</span> Scan suspicious URLs
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyber-accent">→</span> View threat reports and scan history
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
}

export default DashboardHome;
