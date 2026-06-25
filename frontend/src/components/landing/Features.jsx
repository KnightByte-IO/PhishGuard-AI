/**
 * components/landing/Features.jsx
 *
 * Landing page features section — highlights core capabilities.
 */

const features = [
  {
    icon: '🔗',
    title: 'URL Scanner',
    description: 'Analyze suspicious links for phishing, malware, and domain spoofing in seconds.',
  },
  {
    icon: '📧',
    title: 'Email Analyzer',
    description: 'Detect phishing emails with AI that reads tone, sender patterns, and malicious links.',
  },
  {
    icon: '💬',
    title: 'SMS Analyzer',
    description: 'Identify smishing attempts in text messages before you click or reply.',
  },
  {
    icon: '📸',
    title: 'Screenshot Analyzer',
    description: 'Upload website screenshots — our AI inspects visual phishing indicators.',
  },
  {
    icon: '🧠',
    title: 'AI Explanations',
    description: 'Every result includes clear reasons — not just Safe or Dangerous, but why.',
  },
  {
    icon: '📊',
    title: 'Threat Reports',
    description: 'Track your scan history and build security awareness over time.',
  },
];

function Features() {
  return (
    <section id="features" className="py-24 bg-cyber-darker/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need to Stay Safe
          </h2>
          <p className="text-cyber-muted max-w-2xl mx-auto">
            Multi-channel phishing detection powered by Google Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="card hover:border-cyber-accent/50 transition-colors">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-cyber-muted text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
