import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const updateAdminSettings = async (settings) => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};
