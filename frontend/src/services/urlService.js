/**
 * services/urlService.js
 *
 * Frontend API calls for the URL Intelligence Engine.
 */

import api from './api';

/**
 * POST /api/url/analyze — Run rule-based URL analysis.
 */
export const analyzeUrl = async (url) => {
  const response = await api.post('/url/analyze', { url });
  return response.data;
};

/**
 * GET /api/url/history — Fetch user's past URL scans.
 */
export const getUrlHistory = async (limit = 20) => {
  const response = await api.get('/url/history', { params: { limit } });
  return response.data;
};

/**
 * GET /api/url/stats — Dashboard statistics and recent scans.
 */
export const getUrlStats = async () => {
  const response = await api.get('/url/stats');
  return response.data;
};

/**
 * POST /api/url/explain — Generate AI threat explanation for a scan.
 */
export const explainUrl = async (scanId) => {
  const response = await api.post('/url/explain', { scanId });
  return response.data;
};

/**
 * GET /api/url/reports — List all threat reports.
 */
export const getThreatReports = async (limit = 20) => {
  const response = await api.get('/url/reports', { params: { limit } });
  return response.data;
};

/**
 * GET /api/url/reports/:scanId — Single threat report detail.
 */
export const getThreatReport = async (scanId) => {
  const response = await api.get(`/url/reports/${scanId}`);
  return response.data;
};
