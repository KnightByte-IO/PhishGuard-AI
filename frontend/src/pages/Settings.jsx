/**
 * pages/Settings.jsx
 * ------------------
 * User settings page — placeholder for a future milestone.
 */

import DashboardLayout from '../layouts/DashboardLayout';
import PlaceholderCard from '../components/PlaceholderCard';
import { useAuth } from '../hooks/useAuth';

function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Name: </span>
              <span className="text-white">{user?.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Email: </span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Member since: </span>
              <span className="text-white">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <PlaceholderCard
          icon="⚙️"
          title="Advanced Settings"
          description="Password change, notification preferences, and API key management will be available in a future milestone."
        />
      </div>
    </DashboardLayout>
  );
}

export default Settings;
