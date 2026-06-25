/**
 * services/screenshotService.js
 *
 * Frontend API helpers for the Screenshot Analyzer.
 */

import api from './api';

export const analyzeScreenshot = async (payload) => {
  const response = await api.post('/screenshot/analyze', payload);
  return response.data;
};

export const getScreenshotHistory = async () => {
  const response = await api.get('/screenshot/history');
  return response.data;
};
