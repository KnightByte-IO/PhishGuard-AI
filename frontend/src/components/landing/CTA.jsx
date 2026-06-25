/**
 * components/landing/CTA.jsx
 *
 * Call-to-action section at bottom of landing page.
 */

import { Link } from 'react-router-dom';

function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-cyber-accent/10 to-cyber-darker">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Protect Yourself?
        </h2>
        <p className="text-cyber-muted mb-8 max-w-xl mx-auto">
          Join PhishGuard AI and start analyzing suspicious content with AI-powered threat detection.
        </p>
        <Link to="/register" className="btn-primary text-base px-8 py-3 inline-block">
          Create Free Account
        </Link>
      </div>
    </section>
  );
}

export default CTA;
