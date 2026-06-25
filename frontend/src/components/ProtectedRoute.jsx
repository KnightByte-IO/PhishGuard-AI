/**
 * components/ProtectedRoute.jsx
 *
 * Wrapper for routes that require authentication.
 * Redirects to /login if user is not logged in.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
        <div className="text-cyber-accent animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Not logged in — redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
