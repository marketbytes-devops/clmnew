import axios from 'axios';

const camelToSnake = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {});
};

const snakeToCamel = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/(_\w)/g, match => match[1].toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {});
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const isPublicRequest = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/public') ||
      window.location.pathname.startsWith('/client') ||
      (config.url && config.url.includes('/auth/login')) ||
      (config.url && config.url.includes('/auth/register')) ||
      (config.url && config.url.includes('/api/client'))
    );

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !isPublicRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.data = camelToSnake(config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = snakeToCamel(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not redirect if the request was an explicit login attempt, public view, or client portal
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/login');
      const isPublicView = typeof window !== 'undefined' && (
        window.location.pathname.startsWith('/public') ||
        window.location.pathname.startsWith('/client')
      );
      const isClientApi = error.config && error.config.url && error.config.url.includes('/api/client');
      
      if (!isLoginRequest && !isPublicView && !isClientApi && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
