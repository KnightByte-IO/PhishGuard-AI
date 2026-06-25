/**
 * components/landing/Footer.jsx
 * -----------------------------
 * Site footer with links and copyright.
 */

import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-cyber-border bg-cyber-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <span className="font-bold">
                Phish<span className="text-cyber-accent">Guard</span> AI
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered phishing detection and security awareness platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-cyber-accent">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-cyber-accent">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-cyber-accent">Pricing</a></li>
              <li><a href="#faq" className="hover:text-cyber-accent">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/login" className="hover:text-cyber-accent">Login</Link></li>
              <li><Link to="/register" className="hover:text-cyber-accent">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyber-accent">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyber-border pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PhishGuard AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
