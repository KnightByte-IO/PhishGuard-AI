/**
 * pages/RegisterPage.jsx
 *
 * User registration form — calls backend POST /api/auth/register.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/shield.svg" alt="PhishGuard" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-cyber-muted text-sm mt-2">Start protecting yourself from phishing</p>
        </div>

        {error && (
          <div className="bg-cyber-danger/10 border border-cyber-danger/30 text-cyber-danger text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-cyber-muted mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyber-accent transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-cyber-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyber-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-cyber-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyber-accent transition-colors"
              placeholder="Minimum 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-cyber-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cyber-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
