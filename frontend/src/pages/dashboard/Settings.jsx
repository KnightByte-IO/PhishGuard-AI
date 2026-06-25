/**
 * pages/dashboard/Settings.jsx
 *
 * Active settings page for profile updates and password changes.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getSettingsProfile,
  updateSettingsProfile,
  updateSettingsPassword,
} from '../../services/settingsService';

function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getSettingsProfile();
        setProfile({
          name: response.data.name || '',
          email: response.data.email || '',
        });
      } catch {
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
        });
      }
    };

    loadProfile();
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await updateSettingsProfile(profile);
      updateUser(response.data);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await updateSettingsPassword(passwords);
      setMessage(response.message || 'Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-cyber-muted text-sm">
          Manage your profile and security preferences.
        </p>
      </div>

      {(message || error) && (
        <div className={`card ${error ? 'border-red-500/30' : 'border-cyber-accent/30'}`}>
          <p className={error ? 'text-cyber-danger text-sm' : 'text-cyber-accent text-sm'}>
            {error || message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleProfileSave} className="card space-y-4">
          <h2 className="text-white font-semibold">Profile</h2>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
            placeholder="Full name"
          />
          <input
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
            placeholder="Email"
          />
          <button className="btn-primary">Save Profile</button>
        </form>

        <form onSubmit={handlePasswordSave} className="card space-y-4">
          <h2 className="text-white font-semibold">Change Password</h2>
          <input
            type="password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, currentPassword: e.target.value })
            }
            className="w-full bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
            placeholder="Current password"
          />
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
            className="w-full bg-cyber-darker border border-cyber-border rounded-lg px-4 py-3 text-white"
            placeholder="New password"
          />
          <button className="btn-primary">Update Password</button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-white font-semibold mb-4">Account Snapshot</h2>
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
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
