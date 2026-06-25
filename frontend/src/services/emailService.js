/**
 * services/emailService.js
 *
 * Frontend API helpers for the Email Analyzer.
 */

import api from './api';

export const analyzeEmail = async (payload) => {
  const response = await api.post('/email/analyze', payload);
  return response.data;
};

export const getEmailHistory = async () => {
  const response = await api.get('/email/history');
  return response.data;
};
