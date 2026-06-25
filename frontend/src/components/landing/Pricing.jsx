/**
 * components/landing/Pricing.jsx
 *
 * Pricing section placeholder — plans will be defined in a future milestone.
 */

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['10 scans per day', 'URL analysis', 'Basic threat reports'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    features: ['Unlimited scans', 'All analyzers', 'Priority AI analysis', 'Export reports'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Team management', 'API access', 'Custom integrations', 'Dedicated support'],
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-cyber-darker/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple Pricing
          </h2>
          <p className="text-cyber-muted">
            Choose a plan that fits your security needs. <span className="text-cyber-accent">(Placeholder)</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card ${plan.highlighted ? 'border-cyber-accent ring-1 ring-cyber-accent/30' : ''}`}
            >
              {plan.highlighted && (
                <span className="text-xs bg-cyber-accent text-white px-2 py-0.5 rounded-full mb-4 inline-block">
                  Popular
                </span>
              )}
              <h3 className="text-white font-semibold text-xl mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-cyber-muted text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-cyber-muted text-sm flex items-center gap-2">
                    <span className="text-cyber-success">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'} text-sm`}>
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
