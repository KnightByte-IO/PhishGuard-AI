/**
 * services/authService.js
 *
 * Frontend functions that call backend auth API endpoints.
 * Used by AuthContext for register, login, profile, logout.
 */

import api from './api';

/**
 * POST /api/auth/register
 * Creates new user account.
 */
export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT + user data.
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * GET /api/auth/profile
 * Fetches logged-in user's profile (requires JWT).
 */
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};
