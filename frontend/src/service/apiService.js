import { get, post, put, del } from './apiMethods';

// Auth Endpoints
export const loginUser = async (email, password) => {
  return await post('/api/auth/login', { email, password });
};

export const getMe = async () => {
  return await get('/api/auth/me');
};

export const logoutUser = async () => {
  return await post('/api/auth/logout');
};

// Admin Dashboard Endpoints
export const getAdminDashboard = async () => {
  return await get('/api/admin/dashboard');
};

export const getAdminStats = async () => {
  return await get('/api/admin/stats');
};

export const updateAdminSettings = async (settings) => {
  return await put('/api/admin/settings', settings);
};
