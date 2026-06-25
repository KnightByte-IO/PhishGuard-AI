/**
 * components/landing/Hero.jsx
 *
 * Landing page hero section — main headline and CTA.
 */

import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-accent/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyber-accent/10 border border-cyber-accent/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-cyber-success rounded-full animate-pulse" />
            <span className="text-cyber-accent text-sm font-medium">AI-Powered Security</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Detect Phishing Before{' '}
            <span className="text-cyber-accent">It Detects You</span>
          </h1>

          <p className="text-lg text-cyber-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            PhishGuard AI analyzes URLs
            to identify threats — and explains exactly why something is dangerous.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Start Free Analysis
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base px-8 py-3">
              See How It Works
            </a>
          </div>

          {/* Example threat preview */}
          <div className="mt-16 card max-w-lg mx-auto text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-cyber-danger rounded-full" />
              <span className="text-cyber-danger text-sm font-medium">Threat Detected — Risk Score: 94%</span>
            </div>
            <p className="font-mono text-sm text-cyber-muted mb-3">
              https://amaz0n-login-security.com
            </p>
            <ul className="space-y-1.5 text-sm text-cyber-muted">
              <li>• Domain impersonates Amazon</li>
              <li>• Suspicious keywords detected</li>
              <li>• Recently registered domain</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
