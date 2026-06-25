/**
 * services/smsService.js
 *
 * Frontend API helpers for the SMS Analyzer.
 */

import api from './api';

export const analyzeSms = async (payload) => {
  const response = await api.post('/sms/analyze', payload);
  return response.data;
};

export const getSmsHistory = async () => {
  const response = await api.get('/sms/history');
  return response.data;
};
