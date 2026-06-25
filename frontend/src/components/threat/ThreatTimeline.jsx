/**
 * components/threat/ThreatTimeline.jsx
 *
 * Visual timeline showing scan date and AI explanation generation.
 */

function ThreatTimeline({ scan }) {
  const events = [
    {
      label: 'URL Scanned',
      date: scan.analysisDate,
      icon: '🔍',
      description: `Rule-based analysis completed — Risk: ${scan.riskScore}/100 (${scan.riskLevel})`,
    },
  ];

  if (scan.aiGenerated && scan.aiGeneratedAt) {
    events.push({
      label: 'AI Explanation Generated',
      date: scan.aiGeneratedAt,
      icon: '🤖',
      description: `Threat type identified: ${scan.attackType || 'Unknown'}`,
    });
  }

  return (
    <div className="card">
      <h4 className="text-sm font-semibold text-white mb-4">Timeline</h4>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center text-sm">
                {event.icon}
              </div>
              {index < events.length - 1 && (
                <div className="w-px flex-1 bg-cyber-border my-1" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-white text-sm font-medium">{event.label}</p>
              <p className="text-cyber-muted text-xs mt-0.5">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThreatTimeline;
