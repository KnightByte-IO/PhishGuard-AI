/**
 * context/AuthContext.jsx
 *
 * Global authentication state for the entire React app.
 * Provides: user, token, login, register, logout, loading.
 *
 * Why Context instead of Redux?
 * - Simpler for auth-only state
 * - Built into React — no extra library
 * - Easy to explain in interviews
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * On app load: check if token exists in localStorage.
   * If yes, fetch profile to restore logged-in session.
   */
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        try {
          const response = await authService.getProfile();
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch {
          // Token invalid — clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Save user and token after successful login/register.
   */
  const persistAuth = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    persistAuth(response.data.user, response.data.token);
    return response;
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    persistAuth(response.data.user, response.data.token);
    return response;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
