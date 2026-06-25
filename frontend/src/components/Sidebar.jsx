/**
 * components/Sidebar.jsx
 *
 * Dashboard sidebar navigation.
 * Highlights active route and includes logout button.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', end: true },
  { path: '/url-scanner', label: 'URL Scanner', icon: '🔗' },
  { path: '/dashboard/email-analyzer', label: 'Email Analyzer', icon: '📧' },
  { path: '/dashboard/sms-analyzer', label: 'SMS Analyzer', icon: '💬' },
  { path: '/dashboard/screenshot-analyzer', label: 'Screenshot Analyzer', icon: '📸' },
  { path: '/dashboard/threat-reports', label: 'Threat Reports', icon: '⚠️' },
  { path: '/dashboard/history', label: 'History', icon: '📜' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-cyber-darker border-r border-cyber-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <img src="/shield.svg" alt="PhishGuard" className="w-7 h-7" />
          <span className="font-bold text-white text-sm">
            Phish<span className="text-cyber-accent">Guard</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-cyber-accent/20 text-cyber-accent'
                  : 'text-cyber-muted hover:text-white hover:bg-cyber-card'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-cyber-border">
        <div className="mb-3 px-3">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <p className="text-cyber-muted text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cyber-danger hover:bg-cyber-danger/10 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
