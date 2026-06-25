/**
 * components/Navbar.jsx
 *
 * Top navigation bar for public pages.
 * Shows logo, nav links, and Login/Register or Dashboard button.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="border-b border-cyber-border bg-cyber-darker/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/shield.svg" alt="PhishGuard" className="w-8 h-8" />
            <span className="font-bold text-lg text-white">
              Phish<span className="text-cyber-accent">Guard</span> AI
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-cyber-muted hover:text-white text-sm transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-cyber-muted hover:text-white text-sm transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-cyber-muted hover:text-white text-sm transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-cyber-muted hover:text-white text-sm transition-colors">
              FAQ
            </a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
