/**
 * utils/riskHelpers.js
 *
 * Shared helpers for displaying risk levels with consistent colors.
 */

export const RISK_COLORS = {
  Safe: {
    text: 'text-cyber-success',
    bg: 'bg-cyber-success/10',
    border: 'border-cyber-success/30',
    bar: 'bg-cyber-success',
  },
  Low: {
    text: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    bar: 'bg-blue-400',
  },
  Medium: {
    text: 'text-cyber-warning',
    bg: 'bg-cyber-warning/10',
    border: 'border-cyber-warning/30',
    bar: 'bg-cyber-warning',
  },
  High: {
    text: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    bar: 'bg-orange-400',
  },
  Critical: {
    text: 'text-cyber-danger',
    bg: 'bg-cyber-danger/10',
    border: 'border-cyber-danger/30',
    bar: 'bg-cyber-danger',
  },
};

export const getRiskStyle = (level) => {
  return RISK_COLORS[level] || RISK_COLORS.Safe;
};
