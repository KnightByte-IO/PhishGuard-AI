/**
 * pages/dashboard/DashboardHome.jsx
 *
 * Dashboard home with URL scan stats + AI threat intelligence widgets.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUrlStats } from '../../services/urlService';
import { getRiskStyle } from '../../utils/riskHelpers';
import ThreatReportCard from '../../components/threat/ThreatReportCard';

function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getUrlStats();
        setStats(response.data);
      } catch {
        setStats({
          totalScans: 0,
          highRiskCount: 0,
          safeCount: 0,
          recentScans: [],
          latestThreatReport: null,
          mostCommonThreat: null,
          recentAiExplanations: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      label: 'Total Scans',
      value: stats?.totalScans ?? 0,
      icon: '🔍',
      color: 'text-white',
    },
    {
      label: 'High Risk',
      value: stats?.highRiskCount ?? 0,
      icon: '⚠️',
      color: 'text-cyber-danger',
    },
    {
      label: 'Safe URLs',
      value: stats?.safeCount ?? 0,
      icon: '✅',
      color: 'text-cyber-success',
    },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-cyber-muted text-sm mt-1">
          Your security dashboard — analyze threats and track your protection.
        </p>
      </div>

      {/* Scan stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {loading ? '—' : stat.value}
              </p>
              <p className="text-cyber-muted text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Threat Intelligence row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Latest Threat Report */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Latest Threat Report</h3>
          {loading ? (
            <p className="text-cyber-muted text-sm">Loading...</p>
          ) : stats?.latestThreatReport ? (
            <ThreatReportCard scan={stats.latestThreatReport} />
          ) : (
            <p className="text-cyber-muted text-sm">
              No reports yet.{' '}
              <Link to="/url-scanner" className="text-cyber-accent hover:underline">
                Scan a URL
              </Link>
            </p>
          )}
        </div>

        {/* Most Common Threat */}
        <div className="card border border-cyber-danger/20">
          <h3 className="text-lg font-semibold text-white mb-4">Most Common Threat</h3>
          {loading ? (
            <p className="text-cyber-muted text-sm">Loading...</p>
          ) : stats?.mostCommonThreat ? (
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-cyber-danger mb-2">
                {stats.mostCommonThreat.attackType}
              </p>
              <p className="text-cyber-muted text-sm">
                Detected {stats.mostCommonThreat.count} time
                {stats.mostCommonThreat.count !== 1 ? 's' : ''} across AI explanations
              </p>
            </div>
          ) : (
            <p className="text-cyber-muted text-sm">
              Generate AI explanations on your scans to see threat patterns here.
            </p>
          )}
        </div>
      </div>

      {/* Recent AI Explanations */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent AI Explanations</h3>
          <Link
            to="/dashboard/threat-reports"
            className="text-cyber-accent text-sm hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-cyber-muted text-sm">Loading...</p>
        ) : stats?.recentAiExplanations?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentAiExplanations.map((scan) => {
              const style = getRiskStyle(scan.riskLevel);
              return (
                <Link
                  key={scan._id}
                  to={`/dashboard/threat-reports/${scan._id}`}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg bg-cyber-darker/50 border border-cyber-border hover:border-cyber-accent/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-mono truncate">
                      {scan.originalUrl}
                    </p>
                    {scan.summary && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{scan.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {scan.attackType && (
                      <span className="text-xs text-cyber-danger hidden sm:block">
                        {scan.attackType}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                      {scan.riskLevel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-cyber-muted text-sm">
            No AI explanations yet. After scanning a URL, click &quot;Generate AI Explanation&quot;.
          </p>
        )}
      </div>

      {/* Quick action */}
      <div className="card border border-cyber-accent/20 bg-cyber-accent/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">URL Intelligence Engine</h3>
            <p className="text-cyber-muted text-sm mt-1">
              Rule-based scanning + Gemini AI explanations.
            </p>
          </div>
          <Link to="/url-scanner" className="btn-primary text-center">
            Scan a URL
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
