/**
 * services/settingsService.js
 *
 * Frontend API helpers for account settings.
 */

import api from './api';

export const getSettingsProfile = async () => {
  const response = await api.get('/settings/profile');
  return response.data;
};

export const updateSettingsProfile = async (payload) => {
  const response = await api.put('/settings/profile', payload);
  return response.data;
};

export const updateSettingsPassword = async (payload) => {
  const response = await api.put('/settings/password', payload);
  return response.data;
};
