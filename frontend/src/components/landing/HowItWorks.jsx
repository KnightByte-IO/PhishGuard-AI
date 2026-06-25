/**
 * components/landing/HowItWorks.jsx
 *
 * Step-by-step explanation of how PhishGuard AI works.
 */

const steps = [
  {
    step: '01',
    title: 'Submit Content',
    description: 'Paste a URL, email, SMS, or upload a screenshot you want to analyze.',
  },
  {
    step: '02',
    title: 'AI Analysis',
    description: 'Google Gemini AI examines patterns, language, domains, and visual cues.',
  },
  {
    step: '03',
    title: 'Get Results',
    description: 'Receive a risk score, threat classification, and detailed explanation.',
  },
  {
    step: '04',
    title: 'Stay Protected',
    description: 'Review your history and learn to spot phishing attempts on your own.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-cyber-muted max-w-2xl mx-auto">
            Four simple steps from suspicious content to actionable security insight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-bold text-cyber-accent/20 mb-4">{item.step}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-cyber-muted text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
