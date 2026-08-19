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

let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
  withCredentials: true, // Send and receive HttpOnly session cookies automatically
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

    // If an in-memory token is available, pass it in Authorization header
    if (inMemoryToken && !isPublicRequest) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = snakeToCamel(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url && (
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/register') ||
        originalRequest.url.includes('/auth/refresh') ||
        originalRequest.url.includes('/auth/me')
      );
      const isPublicView = typeof window !== 'undefined' && (
        window.location.pathname.startsWith('/public') ||
        window.location.pathname.startsWith('/client')
      );

      if (isAuthEndpoint || isPublicView) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data?.access_token || refreshResponse.data?.accessToken;
        if (newToken) {
          setAuthToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAuthToken(null);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
