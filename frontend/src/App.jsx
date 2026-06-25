/**
 * App.jsx
 *
 * Root component — defines all routes and wraps app with AuthProvider.
 *
 * Route structure:
 *   Public routes  → Landing, Login, Register (PublicLayout)
 *   Protected routes → Dashboard pages (DashboardLayout + ProtectedRoute)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard pages
import DashboardHome from './pages/dashboard/DashboardHome';
import UrlScanner from './pages/dashboard/UrlScanner';
import EmailAnalyzer from './pages/dashboard/EmailAnalyzer';
import SmsAnalyzer from './pages/dashboard/SmsAnalyzer';
import ScreenshotAnalyzer from './pages/dashboard/ScreenshotAnalyzer';
import ThreatReports from './pages/dashboard/ThreatReports';
import ThreatReportDetailPage from './pages/dashboard/ThreatReportDetailPage';
import History from './pages/dashboard/History';
import Settings from './pages/dashboard/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes with navbar + footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected dashboard routes with sidebar */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/url-scanner" element={<UrlScanner />} />
            <Route path="/dashboard/url-scanner" element={<Navigate to="/url-scanner" replace />} />
            <Route path="/dashboard/email-analyzer" element={<EmailAnalyzer />} />
            <Route path="/dashboard/sms-analyzer" element={<SmsAnalyzer />} />
            <Route path="/dashboard/screenshot-analyzer" element={<ScreenshotAnalyzer />} />
            <Route path="/dashboard/threat-reports" element={<ThreatReports />} />
            <Route path="/dashboard/threat-reports/:scanId" element={<ThreatReportDetailPage />} />
            <Route path="/dashboard/history" element={<History />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Route>

          {/* Catch-all — redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
