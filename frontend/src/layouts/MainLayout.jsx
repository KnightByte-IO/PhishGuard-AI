/**
 * layouts/MainLayout.jsx
 * ----------------------
 * Layout wrapper for public pages (landing, login, register).
 * Provides a consistent navbar and footer structure.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function MainLayout({ children }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-cyber-border bg-cyber-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-lg">
              Phish<span className="text-cyber-accent">Guard</span> AI
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

export default MainLayout;
