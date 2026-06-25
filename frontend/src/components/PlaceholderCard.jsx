/**
 * components/PlaceholderCard.jsx
 *
 * Reusable placeholder card for dashboard pages not yet implemented.
 * Shows title, description, and "Coming Soon" badge.
 */

function PlaceholderCard({ title, description, icon }) {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="text-3xl text-cyber-accent">{icon}</div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <span className="text-xs bg-cyber-accent/20 text-cyber-accent px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-cyber-muted text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderCard;
