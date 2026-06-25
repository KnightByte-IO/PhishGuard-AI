/**
 * components/Footer.jsx
 *
 * Site footer with links and copyright.
 */

import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-cyber-border bg-cyber-darker py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/shield.svg" alt="PhishGuard" className="w-6 h-6" />
              <span className="font-bold text-white">
                Phish<span className="text-cyber-accent">Guard</span> AI
              </span>
            </div>
            <p className="text-cyber-muted text-sm max-w-sm">
              AI-powered phishing detection and security awareness platform.
              Protect yourself from online threats with intelligent analysis.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-cyber-muted">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-cyber-muted">
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyber-border mt-8 pt-8 text-center text-cyber-muted text-sm">
          © {new Date().getFullYear()} PhishGuard AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
