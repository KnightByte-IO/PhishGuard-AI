/**
 * pages/dashboard/Settings.jsx
 *
 * User settings page placeholder.
 */

import { useAuth } from '../../hooks/useAuth';
import PlaceholderCard from '../../components/PlaceholderCard';

function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-cyber-muted text-sm mb-8">
        Manage your account and preferences.
      </p>

      {/* Current user info */}
      <div className="card mb-4">
        <h2 className="text-white font-medium mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-cyber-muted">Name</span>
            <span className="text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyber-muted">Email</span>
            <span className="text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyber-muted">Member Since</span>
            <span className="text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : '—'}
            </span>
          </div>
        </div>
      </div>

      <PlaceholderCard
        title="Profile & Security Settings"
        description="Update your profile, change password, and configure notification preferences. Available in a future milestone."
        icon="⚙️"
      />
    </div>
  );
}

export default Settings;
