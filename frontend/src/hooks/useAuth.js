/**
 * hooks/useAuth.js
 *
 * Custom hook to access AuthContext easily.
 * Instead of useContext(AuthContext) everywhere, use useAuth().
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
