/**
 * pages/dashboard/SmsAnalyzer.jsx
 *
 * SMS Analyzer page placeholder.
 */

import PlaceholderCard from '../../components/PlaceholderCard';

function SmsAnalyzer() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">SMS Analyzer</h1>
      <p className="text-cyber-muted text-sm mb-8">
        Analyze text messages for smishing and social engineering attacks.
      </p>

      <PlaceholderCard
        title="SMS / Smishing Detection"
        description="Detect fraudulent text messages that try to trick you into clicking malicious links or sharing personal information."
        icon="💬"
      />
    </div>
  );
}

export default SmsAnalyzer;
